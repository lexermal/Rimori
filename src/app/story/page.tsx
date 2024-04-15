'use client';

import { useMakeCopilotReadable } from '@copilotkit/react-core';
import React, { memo, useEffect } from 'react';

import EmbeddedAssistent from '@/components/EmbeddedAssistent/EmbeddedAssistent';

import { examSummary } from './pomponents/ExamUtils';
import { useGlobalContext } from '@/components/GlobalContext';

const Page = memo(() => {
  const { subscribe, publish } = useGlobalContext();
  useMakeCopilotReadable(JSON.stringify({ examSummary: examSummary }));

  //useEffect that searches a input field, types "/start" and presses enter
  useEffect(() => {
    setTimeout(() => {
      // startConversation();
      console.log('triggering startConversation');
      publish('story_assistant_chat_send_message', 'Hello, world!');
    }, 3000);
    console.log('useEffect');
  }, []);

  return (
    <div>
      <h1 className='text-center mt-5 mb-5'>Story time!</h1>
      <EmbeddedAssistent id='story_assistant' instructions={instructions} />
    </div>
  );
}
);
export default Page;

const instructions = `
Act as a story teller. 
Create a story about ""
`;
