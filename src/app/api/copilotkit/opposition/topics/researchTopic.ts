// this whole file is based on https://github.com/CopilotKit/presentation-demo/blob/main/src/app/api/copilotkit/research.ts
import { getFileContent } from "@/app/api/markdown/route";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { RunnableLambda } from "@langchain/core/runnables";
import { END, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

//gpt class having the builder pattern to build pipes with gpt models
//every step is an own chatgpt instance and has one specific task
//the pipe is a sequence of steps

interface AgentState {
    topic: string;
    searchResults?: string;
    article?: string;
    critique?: string;
}

function model() {
    return new ChatOpenAI({
        temperature: 0,
        modelName: "gpt-4-1106-preview",
    });
}

let pdffile = "";

async function search({ context }: AgentContext): Promise<AgentContext> {
    const loader = new PDFLoader("/home/mconvert/Code/RIAU-MVP/assets/" + pdffile + ".pdf", {
        parsedItemSeparator: "",
    });
    const info = await loader.load();

    return addToContext(context, {
        searchResults: JSON.stringify(info),
    });
}

async function curate({ context }: AgentContext): Promise<AgentContext> {
    console.log("curating search results");
    const response = await model().invoke(
        [
            new SystemMessage(
                `Your goal is to prepare guiding questions for an opposition between a student an AI.
                The AI takes in 2 different personas and the student has to beat them:
                - Kid: 6 years old, loves to tease people by asking tons of questions. The student should explain a topic in an way that the kid forgets to tease the student.
                - Oldy: 70 years old, has a fixed mindset and believes that he knows everything. The student should explain a topic in a way that the oldy is convinced that he is wrong.
                - Visionary: Wants to know how a concept can be applied in a different setting. The student should explain a topic in a way that the visionary is convinced that the concept can be applied in a different setting.

         Your sole task is to go through the provided information and create the guiding questions needed for the oppositions a JSON list of strings
         in this format:
         {
            kid:[
         {
          opposition_starting_text: "Beginning of the conversation and the question or statement the kid will ask",
          opposition_win_instructions: "Instractions on what the student should do to win against the kid",
         },
         ...
        ]
        }

        The question should sound like the opponent is asking it which means:
        - Kid: The question should be playful and teasing from a 6 year old. It uses the vocabulary of a 6 year old.
        - Oldy: The question should be skeptical and savage.
        - Visionary: The question should be curious and innovative. The new setting should be a concrete example of how the concept can be applied.
        
        
        The instructions should be clear and concise. 
         .`.replace(/\s+/g, " ")
            ),
            new HumanMessage(
                `
       
       Here is a list of source information to curate from:
       ${context.searchResults}`.replace(/\s+/g, " ")
            ),
        ],
        {
            response_format: {
                type: "json_object",
            },
        }
    );
    const info = JSON.parse(response.content as string);
    console.log("curated results:", info);

    return addToContext(context, {
        searchResults: JSON.stringify(info),
    });
}

async function critique({ context }: AgentContext): Promise<AgentContext> {
    console.log("critiquing article");
    return addToContext(context, {
        critique: undefined,
    });
}

async function write({ context }: AgentContext): Promise<AgentContext> {
    console.log("writing article");
    return addToContext(context, {
        article: context.searchResults,
    });
}

async function revise({ context }: AgentContext): Promise<AgentContext> {
    return addToContext(context, {
        article: context.article,
    });
}

// Define the function that determines whether to continue or not
const shouldContinue = (state: { context: AgentState }) => {
    const result = state.context.critique === undefined ? "end" : "continue";
    return result;
};

const workflow = new StateGraph({
    channels: {
        context: {
            value: (x: AgentState, y: AgentState) => y,
            default: () => ({
                topic: "",
            }),
        },
    },
});

workflow.addNode("search", new RunnableLambda({ func: search }));
workflow.addNode("curate", new RunnableLambda({ func: curate }));
workflow.addNode("write", new RunnableLambda({ func: write }));
workflow.addNode("critique", new RunnableLambda({ func: critique }));
workflow.addNode("revise", new RunnableLambda({ func: revise }));

workflow.addEdge("search", "curate");
workflow.addEdge("curate", "write");
workflow.addEdge("write", "critique");

// We now add a conditional edge
workflow.addConditionalEdges(
    // First, we define the start node. We use `agent`.
    // This means these are the edges taken after the `agent` node is called.
    "critique",
    // Next, we pass in the function that will determine which node is called next.
    shouldContinue,
    // Finally we pass in a mapping.
    // The keys are strings, and the values are other nodes.
    // END is a special node marking that the graph should finish.
    // What will happen is we will call `should_continue`, and then the output of that
    // will be matched against the keys in this mapping.
    // Based on which one it matches, that node will then be called.
    {
        // If `tools`, then we call the tool node.
        continue: "revise",
        // Otherwise we finish.
        end: END,
    }
);

workflow.addEdge("revise", "critique");

workflow.setEntryPoint("search");
const app = workflow.compile();

export async function getTopics(file: string, topic: string) {
    return getData(file);
    //disable old test
    pdffile = file;

    const inputs = {
        context: {
            topic,
        },
    };
    const result = await app.invoke(inputs);
    const result2 = JSON.parse(result.context.searchResults);
    console.log("--------------------")
    console.log("result:", result2);
    return result2;
}

interface AgentContext {
    context: AgentState;
}

function addToContext(context: AgentState, newValues: { [key: string]: any }): AgentContext {
    return { context: { ...context, ...newValues } };
}

import { OpenAI } from 'openai';

async function getData(file: string) {
    const openai = new OpenAI();

    let fileContent = await getFileContent(file);
    //replace all markdown images
    fileContent=fileContent.replaceAll(/!\[.*\]\(.*\)/g, "");
    //replace all html images
    fileContent=fileContent.replaceAll(/<img.*>/g, "");

    const completion = await openai.chat.completions.create({
        messages: [
            {
                "role": "system", "content": `Your goal is to prepare guiding questions for an opposition between a student an AI.
            The AI takes in 2 different personas and the student has to beat them:
            - Kid: 6 years old, loves to tease people by asking tons of questions. The student should explain a topic in an way that the kid forgets to tease the student.
            - Oldy: 70 years old, has a fixed mindset and believes that he knows everything. The student should explain a topic in a way that the oldy is convinced that he is wrong.
            - Visionary: Wants to know how a concept can be applied in a different setting. The student should explain a topic in a way that the visionary is convinced that the concept can be applied in a different setting.

     Your sole task is to go through the provided information and create the guiding questions needed for the oppositions a JSON list of strings
     in this format:
     {
        kid:[
     {
      opposition_starting_text: "Beginning of the conversation and the question or statement the kid will ask",
      opposition_win_instructions: "Instractions on what the student should do to win against the kid",
     },
     ...
    ]
    }

    The question should sound like the opponent is asking it which means:
    - Kid: The question should be playful and teasing from a 6 year old. It uses the vocabulary of a 6 year old.
    - Oldy: The question should be skeptical and savage.
    - Visionary: The question should be curious and innovative. The new setting should be a concrete example of how the concept can be applied.
    
    
    The instructions should be clear and concise. `
            },
            {
                "role": "user", "content": `Here is a list of source information to curate from:
            ${fileContent}`
            },
        ],
        model: "gpt-4-1106-preview",
        response_format: { type: "json_object" }
    });
    return JSON.parse(completion.choices[0].message.content!);
}