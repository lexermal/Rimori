import { createLogger } from "@/utils/logger";
import { CopilotBackend, OpenAIAdapter } from "@copilotkit/backend";

export async function POST(req: Request): Promise<Response> {
  const logger = createLogger("POST /api/copilotkit/opposition");
  logger.warn("Endpoint is deprecated but still got called", { request_headers: req.headers });

  return new Response("Endpoint is deprecated", { status: 410 });

  // const copilotKit = new CopilotBackend();

  // return copilotKit.response(req, new OpenAIAdapter({ model: "gpt-4" }));
}
