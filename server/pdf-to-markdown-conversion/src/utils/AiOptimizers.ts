import OpenAI from "openai";
import { OPENAI_API_KEY, SKIP_AI_ENHANCING } from "./constants";
import { createLogger } from "./logger";

const logger = createLogger("AiOptimizers.ts");

async function improvePage(unpretty_markdown_text: string) {
  const systemPrompt = "Format and send the text entered by the user in an easy-to-read Markdown format. Make use of headings and lists. Do not change the content.";

  if (SKIP_AI_ENHANCING) {
    return unpretty_markdown_text;
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  return await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.7,
    messages: [{ "role": "system", "content": systemPrompt },
    { "role": "user", "content": unpretty_markdown_text }],
  })
    .then((response) => response.choices[0].message.content)
    .catch((error) => {
      logger.error('Error:', error);
      return unpretty_markdown_text;
    });
}

export async function improveTextWithAI(pages: string[]) {
  return await Promise.all(pages.map(async (page, index) => {
    logger.info('Improving page ' + (index + 1) + ' with AI');

    return await improvePage(page);
  })).then((result) => result.join('\n\n'));
}