import { createLogger } from "../utils/logger";
import Anthropic from "@anthropic-ai/sdk";
import { TextBlock } from "@anthropic-ai/sdk/resources";
import { ANTHROPIC_API_KEY, SKIPPING_AI_OPTIMIZATION } from "../utils/constants";

const logger = createLogger("AiOptimizers.ts");

export async function improveTextWithAI(unpretty_markdown_text: string): Promise<string> {

  if(SKIPPING_AI_OPTIMIZATION){
    logger.info("Skipping AI optimization to save tokens");
    // AI optimization is disabled to save tokens
    return unpretty_markdown_text;
  }
  
 //call internalConversion function and try again if it fails for 30 times. Weit 1000ms between each try.
  let pretty_markdown_text = unpretty_markdown_text;
  for (let i = 0; i < 30; i++) {
    try {
      pretty_markdown_text = await internalConversion(unpretty_markdown_text);
      break;
    } catch (error:any) {
      if(error?.error?.error?.message === "Output blocked by content filtering policy") {
        logger.warn("Anthropic detected the text as being a paper or a book, skipping optimization");
        return unpretty_markdown_text;
      }

      logger.warn("Request for optimizing text with AI failed.", { error });
      
      if (i === 29) {
        logger.error("Failed to optimize text with AI", { error });
        // throw new Error("Failed to optimize text with AI");
        return unpretty_markdown_text;
      }
      //random number between 20-40
      const random = Math.floor(Math.random() * 20) + 20;
      console.info(`Retrying in ${random} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, random * 1000));
    }
  }

  return pretty_markdown_text;
}

async function internalConversion(unpretty_markdown_text: string): Promise<string> {
  const systemPrompt = `
**Markdown Formatting Instructions for summaries and papers:**

1. Convert user-entered text into Markdown format, ensuring it's easy to read.
2. Utilize Markdown syntax for lists and apply appropriate text formatting without altering the content.
3. Maintain existing headings. Do not change their content or level.
   - For new headings, use only "###" (h3) or "####" (h4) formats.
   - Keep headings that are already "##" (h2) or "#" (h1) unchanged.
4. Transform all list symbols into Markdown list formats.
5. Keep all images unchanged.
6. If the text is a scientific paper, summarize the content of every section in around 400 words.
7. If the text is a scientific paper and the section has a heading, format the heading as h2 (##).
  `;

  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const msg = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    system: systemPrompt,
    max_tokens: 8192,
    messages: [{ "role": "user", "content": unpretty_markdown_text }]
  });

  logger.info("Optimized text with AI", { input_token: msg.usage.input_tokens, output_token: msg.usage.output_tokens });

  return (msg.content[0] as TextBlock).text;
}
