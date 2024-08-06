import { NextRequest, NextResponse } from "next/server";
import { parse } from 'url';

export async function GET(req: NextRequest) {
    const { query } = parse(req.url, true);
    const { file, topic } = query;

    return NextResponse.json(await getData(file!.toString(), topic!.toString()));
};



import { OpenAI } from 'openai';

function getFileContent(file: string) {
    console.log("mocked file reading. Needs to be implemented properly!");
    return "";
}

async function getData(file: string, topic: string) {
    const openai = new OpenAI();

    let fileContent = await getFileContent(file);
    //replace all markdown images
    fileContent = fileContent.replaceAll(/!\[.*\]\(.*\)/g, "");
    //replace all html images
    fileContent = fileContent.replaceAll(/<img.*>/g, "");

    const completion = await openai.chat.completions.create({
        messages: [
            {
                "role": "system", "content": `Your goal is to prepare guiding questions for an opposition between a student an AI.
            The AI takes in 2 different personas and the student has to beat them:
            - Kid: called Leo, 10 years old, loves to tease people by asking tons of questions. The student should explain a concept in an way that the kid forgets to tease the student.
            - Oldy: called Clarance, 70 years old, has a fixed mindset and believes that he knows everything. The student should explain a topic in a way that the oldy is convinced that he is wrong.
            - Visionary: Called Elena. Wants to know how a concept can be applied in a different setting. The student should explain a topic in a way that the visionary is convinced that the concept can be applied in a different setting.

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

    The opposition_starting_text is the sentence opening a conversation and the question or statement the kid will ask. Open the conversation with an introduction about yourself and then everything else. Explain the setting a bit.

    The question should sound like the opponent is asking it which means:
    - Kid: The question should be be about a concept using vocabulary of a 10 year old and being missunderstood by the kid.
    - Oldy: The oppinion should very savage, be about a big concept of the summary and end with a thetorical question.
    - Visionary: The question should be curious and innovative. The new setting should be a concrete example of how the concept can be applied.
    
    For every persona, you should provide 1 question.
    
    The instructions should be clear and concise. `
            },
            {
                "role": "user", "content": `Here is a summary to curate from:
            ${fileContent}`
            },
        ],
        model: "gpt-4-1106-preview",
        response_format: { type: "json_object" }
    });
    return JSON.parse(completion.choices[0].message.content!
        .replaceAll("opposition_starting_text", "firstMessage")
        .replaceAll("opposition_win_instructions", "topic"));
}