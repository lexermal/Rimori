'use client';

import { ToolInvocation } from 'ai';
import { Message, useChat } from 'ai/react';
import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

import AnswerComponent from '@/app/[locale]/story/ChoiceForm';
import Feedback, { StoryFeedback } from '@/app/[locale]/story/Feedback';
import getMarkdownContent from '@/app/[locale]/story/markdownContent';
import { useRouter } from '@/i18n';

let kickOffStory = false;

export default function Story() {
  const [feedback, setFeedback] = React.useState<StoryFeedback | null>(null);
  const [chapterResult, setChapterResult] = React.useState<StoryFeedback[]>([]);
  const { messages, addToolResult, append, isLoading } =
    useChat({
      maxToolRoundtrips: 5,
      initialMessages: [{ id: '1', role: 'system', content: context }],
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
    if (!kickOffStory) {
      kickOffStory = true;
      append({ id: '2', role: 'user', content: 'Generate first chapter.' });
    }
  }, []);

  const agentMessages = messages?.filter((m: Message) => !["system", "user"].includes(m.role));
  const lastAgentMessage = agentMessages[agentMessages.length - 1];
  let visibleMessages = lastAgentMessage ? [lastAgentMessage] : [];


  // console.log("visibleMessages", visibleMessages);

  useEffect(() => {
    if (messages.length > 2 && !lastAgentMessage.toolInvocations && !isLoading) {
      const triggerFunction = chapterResult.length < 5 ? "askForChapterDecision" : "storyEnded";
      console.log("trigger " + triggerFunction);
      append({ id: '3', role: 'user', content: 'You forgot to trigger the function "' + triggerFunction + '".' });
    }
  }, [isLoading]);

  if (messages[messages.length - 2]?.content === "You forgot to trigger the function \"askForChapterDecision\".") {
    console.log("Displaying both messages");
    visibleMessages = [messages[messages.length - 3], messages[messages.length - 1]];
  }

  if (!visibleMessages) return null;

  return visibleMessages.map((m, index) =>
    <>
      <div key={m.id} className='mx-auto max-w-4xl mb-2 text-justify'>
        <ReactMarkdown>
          {m.content.split("functions.askForChapterDecision")[0]}
        </ReactMarkdown>
        {m.toolInvocations?.map((invocation: ToolInvocation) => {
          const toolCallId = invocation.toolCallId;
          const addResult = (result: string) => addToolResult({ toolCallId, result });

          if (visibleMessages.length - 1 === index && feedback) {
            return <Feedback key={toolCallId} feedback={feedback} onContinue={() => {
              addResult("The answer was: " + feedback.chosenOption);
              setFeedback(null);
            }} />
          }

          // render confirmation tool (client-side tool with user interaction)
          return <RenderToolInovation
            key={toolCallId}
            messages={messages}
            toolInvocation={invocation}
            chapterResult={chapterResult}
            onSubmit={f => {
              setChapterResult([...chapterResult, f]);
              setFeedback(f);
            }} />;
        })}
      </div>
    </>
  )
}

function RenderToolInovation(props: { toolInvocation: ToolInvocation & { result?: string }, messages: Message[], onSubmit: (result: StoryFeedback) => void, chapterResult: StoryFeedback[] }) {
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
  } else if (toolName === 'storyEnded') {
    return <StoryEndRendering chapterResult={props.chapterResult} />;
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



const context = `
Act like a storyteller who creates an entertaining story, based on the background information, for the user "Tim".

Your tasks:
- Generate one chapter at a time. 
- The user will answer how the story should continue and whether the answer is correct.
- For correct answers you continue with the next chapter. For wrong answers the story ends.
- After the 5th chapter the story ends.
- The chapter should have max 200 words
- After each chapter trigger the function "askForChapterDecision" to ask the user how the story should continue.
- The title of the chapter is a heading.
- After the story finished call the function "storyEnded" to end the story.

You are not allowed to use key terms mentioned in the background information.
You are not allowed to say things like "Let's ask the user how the story should continue."

Background information: 
\`\`\`markdown
`+ getMarkdownContent() + `
\`\`\`

`;
