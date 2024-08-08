import { openai } from '@ai-sdk/openai';
import { convertToCoreMessages, generateText } from 'ai';
import { NextResponse } from 'next/server';

import getMarkdownContent from '@/app/[locale]/story/markdownContent';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const assistentMessages = messages.filter((m: any) => m.role === 'assistant').map((m: any) => m.content).join('\n');

  // console.log("assistentMessages", assistentMessages);


  const instructions = {
    role: 'system', content: `
    You are an exam examiner. The student is supposed to give answers that reflect the understanding of the book.
    The test is about applying the knowledge based on a studycase. 
    The user has 3 answer possibilities to choose from. The examination should be on the reasoning why he chose the answer.
    Validate the users response.
    You are to evaluate the student's answer based on the following criteria:
    - Understanding of the studycase
    - Coherence of the answers
    - Use of appropriate vocabulary
    - Deep understanding of the book
    - Applying the vocabulary of book

    The response should be in the form of a feedback to the student looking like this:
    {
    "understanding": 0-10,
    "coherence": 0-10,
    "vocabulary": 0-10,
    "deepUnderstanding": 0-10
    "generalFeedback": "Your response is..."
    "suggestions": "You can improve by..."
    "grade": "A-F"
    "isAnswerCorrect": true/false
    }

    isAnswerCorrect should be true if the reasoning is correc.

    The book content the student is supposed to be familiar with is as follows:
\`\`\`markdown
`+ getMarkdownContent() + `
\`\`\`

The studycase is as follows:
\`\`\`markdown
`+ assistentMessages + `
\`\`\`
    `};


  const userMessage = messages.filter((m: any) => m.role === 'user').slice(-1);

  // console.log("userMessage", userMessage);

  const messagesWithInstructions = [instructions, ...userMessage];

  const result = await generateText({
    model: openai('gpt-4-turbo'),
    messages: convertToCoreMessages(messagesWithInstructions),
  });

  console.log("result", result.text);

  return NextResponse.json({ result: JSON.parse(result.text) });
}