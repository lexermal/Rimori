import { Message } from '@copilotkit/shared';
import React from 'react';
import { useEffect } from 'react';

import { SpinnerIcon } from '@/components/ai-sidebar/Icons';

import TTS, { VoiceId } from './Voice/TTS';

export interface MessagesProps {
  messages: Message[];
  inProgress: boolean;
  hideUserMessages?: boolean;
  AssistantMessageComponent?: React.ComponentType<{ message: Message }>;
  onlyShowLastAssistantMessage?: boolean;
  spinner?: React.ReactNode;
  enableVoice?: boolean;
}

export default function CustomMessages({
  messages,
  inProgress,
  hideUserMessages,
  AssistantMessageComponent,
  onlyShowLastAssistantMessage,
  spinner,
  enableVoice,
}: MessagesProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [tts, setTTS] = React.useState<TTS | null>(null);
  const prefLastAssistentMessage = React.useRef<string | null>();
  const updateCount = React.useRef<number>(0);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'auto',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, inProgress]);

  useEffect(() => {
    if (!enableVoice) return;

    const assistentMessages = messages.filter(
      (message) => message.role === 'assistant',
    );

    const lastMessage =
      assistentMessages[assistentMessages.length - 1]?.content;

    if (inProgress && !tts) {
      TTS.createAsync(VoiceId.OLD_MAN).then((tts) => {
        console.log('TTS created');
        setTTS(tts);
      });
    }

    if (lastMessage) {
      if (lastMessage.includes(prefLastAssistentMessage.current || '')) {
        if (updateCount.current % 2 === 0) {
          // Only send message on every second update
          // console.log('Sending message', newSubstring);
          sendMessage(lastMessage);
        }
        updateCount.current++;
      }

      if (!inProgress) {
        sendMessage(lastMessage, true);
        prefLastAssistentMessage.current = '';
        tts?.endConversation();
        console.log('TTS ended');
        setTTS(null);
      }
    }
  }, [messages, inProgress]);

  function sendMessage(lastMessage: string, everything = false) {
    let newSubstring = lastMessage.replace(
      prefLastAssistentMessage.current || '',
      '',
    );

    if (everything) {
      console.log('will send full last rest of message:' + newSubstring);
      tts?.sendMessage(newSubstring);
      return;
    }
    const parts = newSubstring.split(' ');
    if (parts.length > 1 && !(parts.length === 2 && parts[0] === '')) {
      const subString = parts.splice(0, parts.length - 1).join(' ');
      console.log('will send message:' + subString);
      console.log('full string would have been:' + newSubstring);
      newSubstring = subString;
    }
    //check if newSubstring constains a sentence ending like . or ! or ?
    //if it does, send each part separately
    const parts2 = newSubstring.split(/(?<=[.?!])/);
    parts2.forEach((part) => {
      tts?.sendMessage(part);
    });
    // console.log('newSubstring:' + newSubstring);
    // console.log(
    //   'prefLastAssistentMessage.current: ',
    //   prefLastAssistentMessage.current,
    // );
    // append the new substring to the prefLastAssistentMessage
    prefLastAssistentMessage.current = prefLastAssistentMessage.current
      ? prefLastAssistentMessage.current + newSubstring
      : newSubstring;
  }

  return (
    <div className='copilotKitMessages'>
      {messages
        .filter((message, index) => {
          if (hideUserMessages && message.role === 'user') {
            return false;
          }

          if (onlyShowLastAssistantMessage && message.role === 'user') {
            //if last message is from user
            if (
              index === messages.length - 2 &&
              messages[messages.length - 1].role === 'user'
            ) {
              return true;
            }
            return index === messages.length - 1;
          }

          return true;
        })
        .map((message, index) => {
          const isCurrentMessage = index === messages.length - 1;

          if (message.role === 'user') {
            return (
              <div
                key={index}
                className='copilotKitMessage copilotKitUserMessage'
              >
                {message.content}
              </div>
            );
          } else if (message.role == 'assistant') {
            if (
              isCurrentMessage &&
              inProgress &&
              !message.content &&
              !message.partialFunctionCall
            ) {
              // The message is in progress and there is no content- show the spinner
              if (spinner) {
                return spinner;
              }
              return (
                <div
                  key={index}
                  className='copilotKitMessage copilotKitAssistantMessage'
                >
                  {SpinnerIcon}
                </div>
              );
            }

            if (message.content) {
              if (AssistantMessageComponent) {
                return (
                  <AssistantMessageComponent key={index} message={message} />
                );
              }
              return (
                <div
                  key={index}
                  className='copilotKitMessage copilotKitAssistantMessage'
                >
                  {message.content}
                  {/* <Markdown content={message.content} /> */}
                </div>
              );
            }

            if (message.partialFunctionCall) {
              return (
                <div
                  key={index}
                  className='copilotKitMessage copilotKitAssistantMessage'
                >
                  {message.content}
                  {/* <Markdown content={message.partialFunctionCall} /> */}
                </div>
              );
            }

            if (message.function_call) {
              // return <div key={index}/>;
              return (
                <div
                  key={index}
                  className='copilotKitMessage copilotKitAssistantMessage'
                >
                  {message.content}
                  {/* <Markdown content={functionResults[message.id]} /> */}
                </div>
              );
            }
          }

          return null;
        })}
      <div ref={messagesEndRef} />
    </div>
  );
}
