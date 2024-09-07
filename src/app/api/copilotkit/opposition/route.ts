import { CopilotBackend, OpenAIAdapter } from "@copilotkit/backend";
import { Action } from "@copilotkit/shared";

import { researchWithLangGraph } from "./researchTopic";

// export const runtime = "edge";

export async function POST(req: Request): Promise<Response> {
  console.log("POST /api/copilotkit/opposition");

  const copilotKit = new CopilotBackend();

  return copilotKit.response(req, new OpenAIAdapter({ model: "gpt-4" }));
}
