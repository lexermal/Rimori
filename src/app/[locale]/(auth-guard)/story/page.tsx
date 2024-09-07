'use client';

import { ToolInvocation } from 'ai';
import { Message, useChat } from 'ai/react';
import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

import AnswerComponent from '@/app/[locale]/(auth-guard)/story/ChoiceForm';
import Feedback, { StoryFeedback } from '@/app/[locale]/(auth-guard)/story/Feedback';
import { useRouter } from '@/i18n';
import { createClient } from '@/utils/supabase/server';
import SupabaseService from '@/utils/supabase/server/Connector';

let kickedOffStory = false;

export default function Story() {
  const [feedback, setFeedback] = React.useState<StoryFeedback | null>(null);
  const [chapterResult, setChapterResult] = React.useState<StoryFeedback[]>([]);
  const [fileId, setFileId] = React.useState<string | null>(null);
  const router = useRouter();

  const { messages, addToolResult, append, isLoading, setMessages } = useChat({
    maxToolRoundtrips: 5,
    api: "/api/story",

    // run client-side tools that are automatically executed:
    // async onToolCall({ toolCall }) {
    //   if (toolCall.toolName === 'storyEnded') {
    //     setStoryEnded(true);
    //     return true;
    //   }
    // },
  });

  console.log("messages", messages);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(session => {
      const fileId = new URLSearchParams(window.location.search).get("file");
      if (!fileId) {
        router.push('/');
        return;
      }
      setFileId(fileId);
      console.log("fileId", fileId);
      getAssistentInstructions(session.data.session!.access_token, fileId).then(data => {
        if (!kickedOffStory) {
          kickedOffStory = true;
          setMessages([{ id: '1', role: 'system', content: data }]);
          append({ id: '2', role: 'user', content: `Generate first chapter. The users name is Alex.` });
        }
      });
    }
    );
  }, []);


  const agentMessages = messages?.filter((m: Message) => !["system", "user"].includes(m.role));
  const lastAgentMessage = agentMessages[agentMessages.length - 1];
  let visibleMessages = lastAgentMessage ? [lastAgentMessage] : [];


  // console.log("visibleMessages", visibleMessages);

  useEffect(() => {
    if (messages.length > 2 && !lastAgentMessage.toolInvocations && !isLoading) {
      if (chapterResult.length < 5) {
        console.log("trigger askForChapterDecision");
        append({ id: '3', role: 'user', content: 'You forgot to trigger the function "askForChapterDecision".' });
      }
    }
  }, [isLoading]);

  if (messages[messages.length - 2]?.content === "You forgot to trigger the function \"askForChapterDecision\".") {
    console.log("Displaying both messages");
    visibleMessages = [messages[messages.length - 3], messages[messages.length - 1]];
  }

  if (!visibleMessages) return null;


  return visibleMessages.map((m, index) => {
    let content = m.content.split("functions.askForChapterDecision")[0];
    const contentSplit = content.split("#");

    content = contentSplit.length > 1 ? "# " + contentSplit[1] : "";

    return <>
      <div key={m.id} className='mx-auto max-w-4xl mb-2 text-justify'>
        <ReactMarkdown>
          {content}
        </ReactMarkdown>
        {m.toolInvocations?.map((invocation: ToolInvocation) => {
          const toolCallId = invocation.toolCallId;
          const addResult = (result: string) => addToolResult({ toolCallId, result });

          if (visibleMessages.length - 1 === index && feedback) {
            return <Feedback key={toolCallId} feedback={feedback} onContinue={() => {
              addResult("The answer was: " + feedback.chosenOption);
              setFeedback(null);
            }} />;
          }

          // render confirmation tool (client-side tool with user interaction)
          return <RenderToolInovation
            fileId={fileId || ""}
            key={toolCallId}
            messages={messages}
            toolInvocation={invocation}
            chapterResult={chapterResult}
            onSubmit={f => {
              setChapterResult([...chapterResult, f]);
              setFeedback(f);
            }} />;
        })}
        {
          chapterResult.length > 4 && <StoryEndRendering chapterResult={chapterResult} />
        }
      </div>
    </>;
  }
  )
}

function RenderToolInovation(props: { toolInvocation: ToolInvocation & { result?: string }, messages: Message[], onSubmit: (result: StoryFeedback) => void, chapterResult: StoryFeedback[], fileId: string }) {
  console.log("toolInvocation", props.toolInvocation);
  const { toolCallId, toolName, args, result } = props.toolInvocation;

  // render confirmation tool (client-side tool with user interaction)
  if (toolName === 'askForChapterDecision') {
    if (result) {
      return "";
    }

    return (
      <div key={toolCallId} className='mt-5'>
        <AnswerComponent
          fileId={props.fileId}
          messages={props.messages}
          question={args.question as string}
          possibilties={[args.possibility1, args.possibility2, args.possibility3]}
          onSubmit={(result: any, choseOption: string) => {
            console.log("result", result);
            result.chosenOption = choseOption;

            props.onSubmit(result);
          }} />
      </div>
    );
  }

  // other tools
  return <OtherToolRendering toolInvocation={props.toolInvocation} />;
}

function StoryEndRendering(props: { chapterResult: StoryFeedback[] }) {
  const router = useRouter();
  let greeting = "Congratulations! You made it to the end, you are on the right track to A's the exam!";

  if (props.chapterResult.length < 4) {
    greeting = "This is no happy ending! You need to study more!";
  }


  return <div className='bg-gray-300 mx-auto max-w-3xl rounded-xl p-5 mt-5'>
    <p className='font-bold text-3xl mb-3'>{greeting}</p>

    <p className="font-bold text-lg">The feedback of the last chapters:</p>
    <ol>
      {props.chapterResult.map((feedback, index) => {
        return <li key={index} className='ms-5 list-disc'>
          <b>Chapter {index + 1}:</b> {feedback.generalFeedback} {feedback.suggestions}
        </li>
      }
      )}
    </ol>
    <button
      onClick={() => router.push('/')}
      className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-5'>
      Finish
    </button>
  </div>;
}

function OtherToolRendering(props: { toolInvocation: ToolInvocation }) {
  //based on example code of vercel documentation
  const { toolCallId, toolName } = props.toolInvocation;

  return 'result' in props.toolInvocation ? (
    <div key={toolCallId}>
      Tool call {`${toolName}: `}
      {props.toolInvocation.result}
    </div>
  ) : (
    <div key={toolCallId}>Calling {toolName}...</div>
  );
}

async function getAssistentInstructions(jwt: string, documentId: string) {
  return `
Act like a usecase developer who creates an intersting usecase, based on the background information.
The usecase consists of 5 chapters that build on each other. 

Your tasks:
- Generate one chapter at a time. 
- The user will answer how the usecase should continue and whether the answer is correct.
- For correct answers you continue with the next chapter. For wrong answers the usecase ends.
- After the 5th chapter the usecase ends.
- The chapter should have max 300 words
- After each chapter trigger the function "askForChapterDecision" to ask the user how the usecase should continue.
- The title of the chapter is a heading.
- After the usecase finished call the function "storyEnded" to end the usecase.

You are prohibited to use key terms mentioned in the background information.

Your answer should be in the form of a chapter:
# "Chapter 1: <Title>" or "The end" 
Once upon a time...

The chapter should end with "How should the story continue?".


Background information: 
\`\`\`markdown
`+ await getMarkdownContent(jwt, documentId) + `
\`\`\`

Remember the usecase should have max 300 words.
`;
}

async function getMarkdownContent(jwt: string, id: string) {
  const db = new SupabaseService(jwt);
  const document = await db.getDocumentContent(id);

  return document.content;
}

