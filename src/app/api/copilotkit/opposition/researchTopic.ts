// this whole file is based on https://github.com/CopilotKit/presentation-demo/blob/main/src/app/api/copilotkit/research.ts
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { RunnableLambda } from "@langchain/core/runnables";
import { END, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import path from 'path';
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
        modelName: "gpt-3.5-turbo-0125",
    });
}

let pdffile = "";

async function search({ context }: AgentContext): Promise<AgentContext> {
    // this function is based on https://js.langchain.com/docs/integrations/document_loaders/file_loaders/pdf

    // Load the PDF data
    // const pdfpath = "/home/mconvert/Code/RIAU-MVP/src/app/api/copilotkit/opposition/pdf-decision-making.pdf";
    console.log("pdfpath:", pdffile);

    const loader = new PDFLoader("/home/mconvert/Code/RIAU-MVP/assets/" + pdffile + ".pdf", {
        parsedItemSeparator: "",
    });
    const docs2 = await loader.load();

    console.log("searching for topic:", context.topic);

    return addToContext(context, {
        searchResults: JSON.stringify(docs2),
    });
}

async function curate({ context }: AgentContext): Promise<AgentContext> {
    console.log("curating search results");
    const response = await model().invoke(
        [
            new SystemMessage(
                `You are an  advanced AI specialized in processing and extracting relevant information from extensive documents. 
         Your sole task is to return a list of relevant information related to the provided topic as a JSON list of strings
         in this format:
         {
            info:[
         {
          title: "title",
          original_text: "original text from the provided source",
          example: "optional example",
         },
         ...
        ]
        }
         .`.replace(/\s+/g, " ")
            ),
            new HumanMessage(
                `Topic: ${context.topic}
       
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
    const info = JSON.parse(response.content as string).info;
    console.log("curated results:", info);
    //console log pretty formatting the info
    // info.forEach((element: any) => {
    //     console.log("title:", element.title);
    //     console.log("original_text:", element.original_text);
    //     console.log("example:", element.example);
    // });
    return addToContext(context, {
        searchResults: JSON.stringify(info),
    });
}

async function critique({ context }: AgentContext): Promise<AgentContext> {
    console.log("critiquing article");
    return addToContext(context, {
        critique: undefined,
    });

    let feedbackInstructions = "";
    if (context.critique) {
        feedbackInstructions =
            `The writer has revised the article based on your previous critique: ${context.critique}
       The writer might have left feedback for you encoded between <FEEDBACK> tags.
       The feedback is only for you to see and will be removed from the final article.
    `.replace(/\s+/g, " ");
    }
    const response = await model().invoke([
        new SystemMessage(
            `You are a personal newspaper writing critique. Your sole purpose is to provide short feedback on a written 
      article so the writer will know what to fix.       
      Today's date is ${new Date().toLocaleDateString("en-GB")}
      Your task is to provide a really short feedback on the article only if necessary.
      if you think the article is good, please return [DONE].
      you can provide feedback on the revised article or just
      return [DONE] if you think the article is good.
      Please return a string of your critique or [DONE].`.replace(/\s+/g, " ")
        ),
        new HumanMessage(
            `${feedbackInstructions}
       This is the article: ${context.article}`
        ),
    ]);
    const content = response.content as string;
    console.log("critique:", content);

    return addToContext(context, {
        critique: content.includes("[DONE]") ? undefined : content,
    });
}

async function write({ context }: AgentContext): Promise<AgentContext> {
    console.log("writing article");
    return addToContext(context, {
        article: context.searchResults,
    });

    const response = await model().invoke([
        new SystemMessage(
            `You are a personal newspaper writer. Your sole purpose is to write a well-written article about a 
      topic using a list of articles. Write 5 paragraphs in markdown.`.replace(
                /\s+/g,
                " "
            )
        ),
        new HumanMessage(
            `Today's date is ${new Date().toLocaleDateString("en-GB")}.
      Your task is to write a critically acclaimed article for me about the provided query or 
      topic based on the sources. 
      Here is a list of articles: ${context.searchResults}
      This is the topic: ${context.topic}
      Please return a well-written article based on the provided information.`.replace(
                /\s+/g,
                " "
            )
        ),
    ]);
    const content = response.content as string;
    console.log("article:", content);
    return addToContext(context, {
        article: content,
    });
}

async function revise({ context }: AgentContext): Promise<AgentContext> {
    return addToContext(context, {
        article: context.article,
    });
    console.log("revising article");
    const response = await model().invoke([
        new SystemMessage(
            `You are a personal newspaper editor. Your sole purpose is to edit a well-written article about a 
      topic based on given critique.`.replace(/\s+/g, " ")
        ),
        new HumanMessage(
            `Your task is to edit the article based on the critique given.
      This is the article: ${context.article}
      This is the critique: ${context.critique}
      Please return the edited article based on the critique given.
      You may leave feedback about the critique encoded between <FEEDBACK> tags like this:
      <FEEDBACK> here goes the feedback ...</FEEDBACK>`.replace(/\s+/g, " ")
        ),
    ]);
    const content = response.content as string;
    console.log("revised article:", content);
    return addToContext(context, {
        article: content,
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

export async function researchWithLangGraph(file: string, topic: string) {
    pdffile = file;

    const inputs = {
        context: {
            topic,
        },
    };
    const result = await app.invoke(inputs);
    const result2 = result.context.article;
    console.log("--------------------")
    console.log("result:", result2);
    return result2;
    const regex = /<FEEDBACK>[\s\S]*?<\/FEEDBACK>/g;
    const article = result.context.article.replace(regex, "");
    return article;
}

interface AgentContext {
    context: AgentState;
}

function addToContext(context: AgentState, newValues: { [key: string]: any }): AgentContext {
    return { context: { ...context, ...newValues } };
}