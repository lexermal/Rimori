import { CopilotBackend, OpenAIAdapter } from "@copilotkit/backend";
import { Action } from "@copilotkit/shared";
import { researchWithLangGraph } from "./researchTopic";

// export const runtime = "edge";

export async function POST(req: Request): Promise<Response> {
  console.log("POST /api/copilotkit/opposition");
  const copilotKit = new CopilotBackend({actions: [researchAction]});

  return copilotKit.response(req, new OpenAIAdapter({model: "gpt-4"}));
}

const researchAction: Action<any> = {
  name: "research",
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
    return await researchWithLangGraph(topic);
  },
};