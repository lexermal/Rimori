import { InputProps } from '@copilotkit/react-ui/dist/components/chat/props';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import VoiceRecorder from './VoiceRecoder';

import { ActivityIcon, SendIcon } from './Icons';
import AutoResizingTextarea from './Textarea';

export const Input = ({
  inProgress,
  onSend,
  children,
  isVisible = false,
}: InputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    [text, inProgress, onSend],
  );

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
};
