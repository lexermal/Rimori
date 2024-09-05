import { NEXT_PUBLIC_ANTHROPIC_API_KEY } from '@/utils/constants';
import SupabaseService from '@/utils/supabase/server/Connector';
import { createAnthropic } from '@ai-sdk/anthropic';
import { convertToCoreMessages, generateText } from 'ai';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, fileId } = await req.json();

  const jwt = req.headers.get('Authorization')!;

  const response = await getAIResponse(messages, jwt, fileId).catch((e) => {
    console.error("Failed to get a valid answer from the AI backend, trying again. The error was:", e);

    return getAIResponse(messages, jwt, fileId);
  });

  return NextResponse.json({ result: response });
}

async function getMarkdownContent(jwt: string, fileId: string) {
  const db = new SupabaseService(jwt);
  const document = await db.getDocument(fileId);
  if (!document) {
    throw new Error('Document not found');
  }
  return document.content;
}

async function getAIResponse(messages: any[], jwt: string, fileId: string) {
  const assistentMessages = messages.filter((m: any) => m.role === 'assistant').map((m: any) => m.content).join('\n');

  const instructions = {
    role: 'system', content: `
    You are an exam examiner. The student is supposed to give answers that reflect the understanding of the book.
    The test is about applying the knowledge based on a studycase. 
    The user has 3 answer possibilities to choose from. The examination should be on the reasoning why he chose the answer.
    Validate the users response. If he writes trash simply give him a bad grade and evaluate his response with 0 points.
    You are to evaluate the student's answer based on the following criteria:
    - Understanding of the studycase
    - Coherence of the answers
    - Use of appropriate vocabulary
    - Deep understanding of the book
    - Applying the vocabulary of book

    Analyze this answer and output in JSON format with keys:
    {
    "understanding": 0-10,
    "coherence": 0-10,
    "vocabulary": 0-10,
    "deepUnderstanding": 0-10
    "generalFeedback": "Your response is..."
    "suggestions": "You can improve by..."
    "grade": "A/B/C/D/E/F"
    "isAnswerCorrect": true/false
    }

    isAnswerCorrect should be true if the reasoning is correc.

    The book content the student is supposed to be familiar with is as follows:
\`\`\`markdown
`+ await getMarkdownContent(jwt, fileId) + `
\`\`\`

The studycase is as follows:
\`\`\`markdown
`+ assistentMessages + `
\`\`\`

Remember your output should be in JSON format.
    `};

  const userMessage = messages.filter((m: any) => m.role === 'user').slice(-1);

  console.log("Users answer was: ", userMessage[0].content);

  const responseFormat = `
  {
    "understanding": 
  `;

  const messagesWithInstructions = [instructions, ...userMessage, { role: 'assistant', content: responseFormat }];
  // const messagesWithInstructions = [instructions, ...userMessage];

  // console.log("Messages with instructions: ", messagesWithInstructions);

  const anthropic = createAnthropic({ apiKey: NEXT_PUBLIC_ANTHROPIC_API_KEY });

  const result = await generateText({
    model: anthropic("claude-3-5-sonnet-20240620"),
    messages: convertToCoreMessages(messagesWithInstructions),
  });

  console.log("AI response: ", responseFormat + result);
  return JSON.parse(responseFormat + result.text);
}