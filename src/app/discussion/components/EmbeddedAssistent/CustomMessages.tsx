import { Message } from '@copilotkit/shared';
import React from 'react';
import { useEffect } from 'react';

import { SpinnerIcon } from '@/components/ai-sidebar/Icons';

import TTS, { VoiceId } from '../../TTS';

export interface MessagesProps {
  messages: Message[];
  inProgress: boolean;
}


export default function CustomMessages({
  messages,
  inProgress,
}: MessagesProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [tts, setTTS] = React.useState<TTS | null>(null);
  const prefLastAssistentMessage = React.useRef<string | null>();

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'auto',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
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
        const newSubstring = lastMessage.replace(
          prefLastAssistentMessage.current || '',
          '',
        );
        console.log('Sending message', newSubstring);
        tts?.sendMessage(newSubstring);
        prefLastAssistentMessage.current = lastMessage;
      }

      if (!inProgress) {
        prefLastAssistentMessage.current = "";
        tts?.endConversation();
        console.log('TTS ended')
        setTTS(null);
      }
    }
  }, [messages, inProgress]);

  return (
    <div className='copilotKitMessages'>
      {messages.map((message, index) => {
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
