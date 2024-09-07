import SupabaseService from "@/utils/supabase/server/Connector";
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from 'openai';
import { parse } from 'url';

export async function GET(req: NextRequest) {
  const { query } = parse(req.url, true);

  const db = new SupabaseService(req.headers.get("authorization"));
  const doc = await db.getDocumentContent(query.file as string);

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  try {
    const topics = await generateExamTopics(doc);
    return NextResponse.json(topics);
  } catch (error) {
    console.error("Error generating exam topics:", error);
    return NextResponse.json({ error: "Failed to generate exam topics" }, { status: 500 });
  }
};

async function generateExamTopics(fileContent: string) {
  const openai = new OpenAI();
  fileContent = fileContent.replace(/!\[.*\]\(.*\)/g, "").replace(/<img.*>/g, "");

  try {
    // const completion = await openai.chat.completions.create({
    //   messages: [
    //     {
    //       "role": "system",
    //       "content": `Your goal is to generate exam topics from a provided document. The topics should cover key areas or concepts found in the content and should be clearly formulated. For each topic, generate a short description of the main idea or question the exam will focus on. Return the result as a JSON array of exactly three topics in this format:
    //           [
    //               {
    //                   "topic": "The topic heading or concept",
    //                   "description": "A short explanation or question for the topic"
    //               },
    //               ...
    //           ]`
    //     },
    //     {
    //       "role": "user", "content": `Here is the document content: ${fileContent}`
    //     }
    //   ],
    //   model: "gpt-4-1106-preview",
    // });

    // let topics = completion.choices[0]?.message?.content?.trim() || "";
    // topics = topics.replace(/```json\n/, "").replace(/\n```/, "");
    // try {
    //   return JSON.parse(topics);
    // } catch (parseError) {
    //   throw new Error("Response is not a valid JSON: " + parseError);
    // }


    const topics = [
      {
        topic: "Introduction to JavaScript",
        description: "Discuss the core concepts of JavaScript including variables, functions, and control flow."
      },
      {
        topic: "Understanding React Components",
        description: "Explain the concept of React components, their lifecycle, and how they interact within a React application."
      },
      {
        topic: "Introduction to Supabase",
        description: "Describe what Supabase is, its features, and how it can be used as a backend service for web applications."
      }
    ]

    return JSON.parse(JSON.stringify(topics));


  } catch (error) {
    console.error("Error generating exam topics:", error || error);
    throw new Error("Failed to generate exam topics");
  }
}
