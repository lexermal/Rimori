import { InputProps } from '@copilotkit/react-ui/dist/components/chat/props';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ActivityIcon, SendIcon } from './Icons';
import AutoResizingTextarea from './Textarea';
import VoiceRecorder from './VoiceRecoder';
import { Destructor, useGlobalContext } from '../../context/GlobalContext';

export const Input = React.memo(
  ({
    inProgress,
    id,
    onSend,
    children,
    isVisible = false,
    otherFeatures = undefined,
  }: InputProps & { id: string; otherFeatures?: React.JSX.Element }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { subscribe, publish } = useGlobalContext();

    const handleDivClick = (event: React.MouseEvent<HTMLDivElement>) => {
      // Check if the clicked element is not the textarea itself
      if (event.target !== event.currentTarget) return;

      textareaRef.current?.focus();
    };

    const [text, setText] = useState('');

    const sendRef = useRef<((textOverwrite?: string) => void) | null>(null);

    const send = useCallback(
      (textOverwrite?: string) => {
        if (inProgress) return;

        onSend(textOverwrite || text);
        setText('');

        textareaRef.current?.focus();
      },
      [text, inProgress, onSend]
    );

    useEffect(() => {
      console.log('subscribe to ', id + '_chat_send_message');
      const unsubscribe = subscribe(
        id + '_chat_send_message',
        (message: string) => {
          send(message);
          //wait 1 second and then till inpprogress is false
          // then call unsubscribe
          setTimeout(() => {
            //wait till inProgress is false
            const interval = setInterval(() => {
              if (!inProgress) {
                clearInterval(interval);
                unsubscribe();
              }
            }, 1000);
          }, 1000);
        }
      ) as Destructor;

      // Unsubscribe when the component unmounts
      return unsubscribe;
    }, []);

    useEffect(() => {
      sendRef.current = send;
    }, [send]);

    useEffect(() => {
      if (isVisible) {
        textareaRef.current?.focus();
      }
    }, [isVisible]);

    const icon = inProgress ? ActivityIcon : SendIcon;
    const disabled = inProgress || text.length === 0;

    return (
      <div className='copilotKitInput' onClick={handleDivClick}>
        <span>{children}</span>
        {otherFeatures}
        <VoiceRecorder
          onVoiceRecorded={(m: string) => {
            sendRef.current?.(m);
          }}
        />
        <button
          className='copilotKitSendButton'
          disabled={disabled}
          onClick={() => send()}
        >
          {icon}
        </button>
        <AutoResizingTextarea
          ref={textareaRef}
          placeholder='Type a message...'
          autoFocus={true}
          maxRows={5}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
        />
      </div>
    );
  }
);
