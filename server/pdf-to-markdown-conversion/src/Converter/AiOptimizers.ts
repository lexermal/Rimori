import { createLogger } from "../utils/logger";
import Anthropic from "@anthropic-ai/sdk";
import { TextBlock } from "@anthropic-ai/sdk/resources";
import { ANTHROPIC_API_KEY } from "../utils/constants";

const logger = createLogger("AiOptimizers.ts");

export async function improveTextWithAI(unpretty_markdown_text: string): Promise<string> {
  const systemPrompt = `
**Markdown Formatting Instructions:**

1. Convert user-entered text into Markdown format, ensuring it's easy to read.
2. Utilize Markdown syntax for lists and apply appropriate text formatting without altering the content.
3. Maintain existing headings. Do not change their content or level.
   - For new headings, use only "###" (h3) or "####" (h4) formats.
   - Keep headings that are already "##" (h2) or "#" (h1) unchanged.
4. Transform all list symbols into Markdown list formats.
5. Keep all images unchanged.
  `;

  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const msg = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    system: systemPrompt,
    max_tokens: 1000 + unpretty_markdown_text.split(" ").length * 2,
    messages: [{ "role": "user", "content": unpretty_markdown_text }]
  });

  logger.info("Response from AI: ", msg.usage);

  return (msg.content[0] as TextBlock).text;
}
