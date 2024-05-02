import pdf2md from '@opendocsg/pdf2md';
import { createCanvas, Image } from 'canvas';

// needed for pdf2md
(global as any).window = {
  Image,
  document: {
    createElement: (nodeName: string) => {
      if (nodeName === 'canvas') return createCanvas(200, 200);
    },
  },
  location: {
    protocol: 'http:',
    // Add other properties if needed
  },
};

import fs from 'fs';
import { writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export const POST = async (req: any) => {
  const formData = await req.formData();

  const files = formData.getAll("file");
  if (!files.length) {
    return NextResponse.json({ error: "No files received." }, { status: 400 });
  }

  const filenames = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name.replaceAll(" ", "_");
    console.log(filename);
    filenames.push(filename);
    try {
      await writeFile(
        path.join(process.cwd(), "assets/" + filename),
        buffer
      );
    } catch (error) {
      console.log("Error occured ", error);
      return NextResponse.json({ Message: "Failed", status: 500 });
    }
  }

  return NextResponse.json({ Message: "Success", status: 201, files: filenames, allFiles:getAllFiles() });
};


async function convert(filePath: string) {
  // TODO: Convert does not work. It only extracts text from the PDF file.
  // To extract images from the PDF file, we need to do the parsing ourselves.
  // I think all page elements are in either getStructTree, getOperatorList or getXfa
  // then extract images with https://github.com/mozilla/pdf.js/issues/14542 (but this way seams to be deprecated)
  // maybe this can help: https://codepen.io/TeoM/pen/abOzEor

  console.log("Think about how to get the images from the PDF file and convert them to markdown.")

  pdf2md(fs.readFileSync(filePath), {
    pageParsed: (pages) => {
      console.log('pages:', pages)
    },
    documentParsed: (document, pages) => {
      // console.log('document:', document)
      // console.log('document pages:', pages)
    }

  })
    .then(text => {

      // console.log('text:', text)

      console.log('Done.')
    })
    .catch(err => {
      console.error(err)
    })
}


import { OpenAI } from 'openai';
import { get } from 'remirror';
import { getAllFiles } from '../files/route';

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



