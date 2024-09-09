import { NEXT_PUBLIC_ANTHROPIC_API_KEY } from "@/utils/constants";
import SupabaseService from "@/utils/supabase/server/Connector";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText, convertToCoreMessages } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { parse } from 'url';

export async function GET(req: NextRequest) {
    const { query } = parse(req.url, true);

    const db = new SupabaseService(req.headers.get("authorization"));
    const doc = await db.getDocumentContent(query.file as string);

    if (!doc) {
        throw new Error("Document not found");
    }

    return NextResponse.json(await getData(doc));
};

async function getData(fileContent: string) {
    //replace all markdown images
    fileContent = fileContent.replaceAll(/!\[.*\]\(.*\)/g, "");
    //replace all html images
    fileContent = fileContent.replaceAll(/<img.*>/g, "");

    const prefilledContent = `{
        "kid":
     {
      "opposition_starting_text": `;

    const messages = [
        {
            "role": "system", "content": `Your goal is to prepare guiding questions for an opposition between a student an AI.
            The AI takes in 2 different personas and the student has to beat them:
            - Kid: called Leo, 10 years old, loves to tease people by asking tons of questions. The student should explain a concept in an way that the kid forgets to tease the student.
            - Oldy: called Clarance, 70 years old, has a fixed mindset and believes that he knows everything. The student should explain a topic in a way that the oldy is convinced that he is wrong.
            - Visionary: Called Elena. Wants to know how a concept can be applied in a different setting. The student should explain a topic in a way that the visionary is convinced that the concept can be applied in a different setting.

     Your sole task is to go through the provided information and create the guiding questions needed for the oppositions a JSON list of strings
     in this format:
     {
        "kid":
     {
      "opposition_starting_text": "Beginning of the conversation and the question or statement the kid will ask",
      "opposition_win_instructions": "Instractions on what the student should do to win against the kid",
     },
     ...
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
        {
            role: "assistant",
            content: prefilledContent
        }
    ] as { role: "system" | "user", content: string }[];

    const anthropic = createAnthropic({ apiKey: NEXT_PUBLIC_ANTHROPIC_API_KEY });
    const result = await generateText({
        model: anthropic("claude-3-5-sonnet-20240620"),
        messages: convertToCoreMessages(messages),
    });

    // console.log(prefilledContent + result.text);

    return JSON.parse((prefilledContent + result.text)
        .replaceAll("opposition_starting_text", "firstMessage")
        .replaceAll("opposition_win_instructions", "topic"));
}