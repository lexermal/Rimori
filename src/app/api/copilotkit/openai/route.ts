import { CopilotBackend, OpenAIAdapter } from "@copilotkit/backend";

export async function POST(req: Request): Promise<Response> {
  console.log("POST /api/copilotkit/openai");
  const copilotKit = new CopilotBackend();

  return copilotKit.response(req, new OpenAIAdapter({model: "gpt-4"}));
}
