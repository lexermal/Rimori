import OpenAI from "openai";

export async function improveTextWithAI(unpretty_markdown_text: string) {
  const systemPrompt = "Format and send the text entered by the user in an easy-to-read Markdown format. Make use of headings and lists. Do not change the content.";

  const openai = new OpenAI();

  const gptResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ "role": "system", "content": systemPrompt },
    { "role": "user", "content": unpretty_markdown_text }],
    temperature: 0.7
  });

  return gptResponse.choices[0].message.content;
}