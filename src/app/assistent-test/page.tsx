'use client';
/* eslint-disable @typescript-eslint/ban-ts-comment */
// import nanoid from 'nanoid';

import { useCopilotChat } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import React from 'react';

import { Input } from './components/Input';

export default function Page(): JSX.Element {
   const makeSystemMessage= (contextString: string, additionalInstructions?: string) => contextString+additionalInstructions;

    const { visibleMessages, append, reload, stop, isLoading, input, setInput } = useCopilotChat({
        id: "15",
        makeSystemMessage,
        additionalInstructions: " act as a artist",
      });

      const sendMessage = async (message: string) => {
        // onSubmitMessage?.(message);
        append({
          id: Math.random().toString(),
          content: message,
          role: "user",
        });
      };
      
      const CustomInput = (props:any) => <Input inProgress={props.inProgress} onSend={props.onSend} />;

    return (
        <div>
            <h1>Page</h1>
            <p>Find me in RIAU-MVP/src/app/assistent-test/page.tsx</p>
            {/* @ts-ignore */}
            <div style={{ '--copilot-kit-primary-color': '#7D5BA6' }}>
                <CopilotSidebar Input={CustomInput} />
            </div>
        </div>
    );
}
