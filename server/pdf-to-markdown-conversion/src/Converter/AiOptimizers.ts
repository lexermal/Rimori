import OpenAI from "openai";
import { OPENAI_API_KEY } from "../utils/constants";
import { createLogger } from "../utils/logger";

const logger = createLogger("AiOptimizers.ts");

export async function improveTextWithAI(unpretty_markdown_text: string): Promise<string> {
  const systemPrompt = `
  Format and send the text entered by the user in an easy-to-read Markdown format. 
  Make use of lists and text formatting. 
  Do not change the content. Don't change the headings.
  Replace ordered and unordered list symbols with Markdown lists.
  If you make something a heading, you are only allowed to use h3 and h4 headings.
  If a heading was h2 or h1 you leave the heading type as it is.
  `;

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  return await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.7,
    messages: [{ "role": "system", "content": systemPrompt },
    { "role": "user", "content": unpretty_markdown_text }],
  })
    .then((response) => response.choices[0].message.content as string)
    .catch((error) => {
      logger.error('Error:', error);
      return "";
    });
}
