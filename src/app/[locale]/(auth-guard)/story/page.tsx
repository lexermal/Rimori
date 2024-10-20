'use client';

import { ToolInvocation } from 'ai';
import { Message, useChat } from 'ai/react';
import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

import AnswerComponent from '@/app/[locale]/(auth-guard)/story/ChoiceForm';
import Feedback, { StoryFeedback } from '@/app/[locale]/(auth-guard)/story/Feedback';
import { useRouter } from '@/i18n';
import { SupabaseClient } from '@/utils/supabase/server';
import EmitterSingleton from '@/app/[locale]/(auth-guard)/discussion/components/Emitter';
import { useUser } from '@supabase/auth-helpers-react';

let kickedOffStory = false;

export default function Story() {
  const [feedback, setFeedback] = React.useState<StoryFeedback | null>(null);
  const [chapterResult, setChapterResult] = React.useState<StoryFeedback[]>([]);
  const [fileId, setFileId] = React.useState<string | null>(null);
  const router = useRouter();
  const user=useUser();

  const { messages, addToolResult, append, isLoading, setMessages } = useChat({
    maxToolRoundtrips: 5,
    api: "/api/story",
  });

  console.log("messages", messages);

  useEffect(() => {
    const supabase = SupabaseClient.getClient();
    supabase.auth.getSession().then(session => {
      const fileId = new URLSearchParams(window.location.search).get("file");
      if (!fileId) {
        router.push('/');
        return;
      }
      setFileId(fileId);
      // console.log("fileId", fileId);
      getAssistentInstructions(session.data.session!.access_token, fileId).then(data => {
        if (!kickedOffStory) {
          kickedOffStory = true;
          setMessages([{ id: '1', role: 'system', content: data }]);
          append({ id: '2', role: 'user', content: `Generate first chapter. The users name is Lisa.` });
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
      if (chapterResult.length < 5 && !lastAgentMessage.content.includes("# The End")) {
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

    content = contentSplit.length > 1 ? "#" + contentSplit[1] : "";

    return <>
      <div key={m.id} className='mx-auto max-w-4xl mb-5 text-justify mt-5'>
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
              EmitterSingleton.emit("analytics-event", {
                category: "story",
                action: "finished-chapter-" + chapterResult.length + "-with-" + f.generalFeedback,
                user: user?.id
              });
            }} />;
        })}
        {
          !isLoading && content.includes("# The End") && <StoryEndRendering chapterResult={chapterResult} />
        }
      </div>
    </>;
  }
  )
}

function RenderToolInovation(props: { toolInvocation: ToolInvocation & { result?: string }, messages: Message[], onSubmit: (result: StoryFeedback) => void, chapterResult: StoryFeedback[], fileId: string }) {
  console.log("toolInvocation", props.toolInvocation);
  const user = useUser();
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
          onSubmit={(result: StoryFeedback, choseOption: string) => {
            console.log("result", result);
            result.chosenOption = choseOption;

            props.onSubmit(result);
            EmitterSingleton.emit("analytics-event", {
              category: "story",
              action: "chapter-" + props.chapterResult.length + "-chosen-" + choseOption+"-correct-"+result.isAnswerCorrect,
              user: user?.id
            });
          }} />
      </div>
    );
  }

  // other tools
  return <OtherToolRendering toolInvocation={props.toolInvocation} />;
}

function StoryEndRendering(props: { chapterResult: StoryFeedback[] }) {
  const router = useRouter();
  const user = useUser();
  let greeting = "Congratulations! You made it to the end!";

  if (props.chapterResult.length < 5) {
    greeting = "This is no happy ending...";
  }

  useEffect(() => {
    EmitterSingleton.emit("analytics-event", {
      category: "story",
      action: "story-ended-successfully-" + (props.chapterResult.length < 5),
      user: user?.id
    });
    EmitterSingleton.emit("analytics-event", {
      category: "story",
      action: "feedback: " + JSON.stringify(props.chapterResult),
      user: user?.id
    });
  });

  return <div className='bg-gray-300 mx-auto max-w-3xl rounded-xl p-5 mt-5'>
    <p className='font-bold text-3xl mb-3'>{greeting}</p>

    <p className="font-bold text-lg">This is the feedback of all chapters:</p>
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
  return fetch("/api/appwrite/documents?documentId=" + id, {
    headers: { Authorization: jwt }
  }).then(response => response.json())
    .then(data => data.data);
}

