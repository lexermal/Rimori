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

// export async function imageContentLookup(base64: string) {

//   const openai = new OpenAI();

//   const response = await openai.chat.completions.create({
//     model: "gpt-4-turbo",
//     messages: [
//       {
//         role: "user",
//         content: [
//           { type: "text", text: "What is this picture about and then give the text written on it." },
//           {
//             type: "image_url",
//             image_url: {
//               "url": "data:image/jpeg;base64," + base64
//             },
//           },
//         ],
//       },
//     ],
//   });
//   console.log(response.choices[0]);
// }



