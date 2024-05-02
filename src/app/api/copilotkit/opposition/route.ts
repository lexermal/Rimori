import { CopilotBackend, OpenAIAdapter } from "@copilotkit/backend";
import { Action } from "@copilotkit/shared";

import { researchWithLangGraph } from "./researchTopic";

// export const runtime = "edge";

export async function POST(req: Request): Promise<Response> {
  console.log("POST /api/copilotkit/opposition");

  // console.log("req: ", req);

   // Parse the request body
   const headers = await req.headers;
  //  console.log("body: ", headers);
   const file = headers.get("file");
  //  console.log("file: ", file);

  const copilotKit = new CopilotBackend({ actions: getActions(file!) });

  return copilotKit.response(req, new OpenAIAdapter({ model: "gpt-4" }));
}

function getActions(file: string) {
  // return []
  return [{
    name: "researchTopic",
    description:
      "Call this function to conduct research on a certain topic. Respect other notes about when to call this function",
    parameters: [
      {
        name: "topic",
        type: "string",
        description: "The topic to research. 5 characters or longer.",
      },
    ],
    handler: async ({ topic }) => {
      console.log("Researching topic: ", topic);
      // return "researching topic";
      return await researchWithLangGraph(file, topic);
    },
  }] as Action<any>[];
};