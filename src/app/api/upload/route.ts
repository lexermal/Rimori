import pdf2md from '@opendocsg/pdf2md';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  const data = req.body;
  const file = data.files[0];

  const filePath = path.join(process.cwd(), '/home/mconvert/Code/RIAU-MVP/files/', file.originalName);

  fs.writeFile(filePath, file.content, 'binary', function (err) {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    convert(filePath);
    return res.status(200).json({ success: true, path: filePath });
  });
}


function convert(filePath: string) {

  console.log("Think about how to get the images from the PDF file and convert them to markdown.")

  pdf2md(fs.readFileSync(filePath), {
    pageParsed: (pages) => {
      console.log('pages:', pages)
    },
    documentParsed: (document, pages) => {
      console.log('document:', document)
      console.log('document pages:', pages)
    }

  })
    .then(text => {

      console.log('text:', text)

      console.log('Done.')
    })
    .catch(err => {
      console.error(err)
    })
}


import { OpenAI } from 'openai';

async function improveTextWithAI(unpretty_markdown_text: string) {
  const systemPrompt = "Format and send the text entered by the user in an easy-to-read Markdown format. Make use of headings and lists. Do not change the content.";

  const openai = new OpenAI({});

  const gptResponse = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ "role": "system", "content": systemPrompt },
    { "role": "user", "content": unpretty_markdown_text }],
    temperature: 0.5
  });

  const improved_text = gptResponse.choices[0];

  console.log("Original text: ", unpretty_markdown_text)
  console.log("Improved text: ", improved_text);

  return improved_text;
}

async function imageContentLookup(base64: string) {

  const openai = new OpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "What is this picture about and then give the text written on it." },
          {
            type: "image_url",
            image_url: {
              "url": "data:image/jpeg;base64," + base64
            },
          },
        ],
      },
    ],
  });
  console.log(response.choices[0]);
}



