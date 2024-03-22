'use client';
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { CopilotSidebar } from '@copilotkit/react-ui';
import React from 'react';

import { Input } from './components/Input';

export default function Page(): JSX.Element {
  const CustomInput = (props: any) => {
    return (
      <Input
        inProgress={props.inProgress}
        onSend={(text) => {
          props.onSend(text);
        }}
      />
    );
  };

  return (
    <div>
      <h1>Page</h1>
      <p>Find me in RIAU-MVP/src/app/assistent-test/page.tsx</p>
      {/* @ts-ignore */}
      <div style={{ '--copilot-kit-primary-color': '#7D5BA6' }}>
        <CopilotSidebar key={7} defaultOpen={true} Input={CustomInput} />
      </div>
    </div>
  );
}
