'use client';

import { CopilotKit, useMakeCopilotReadable } from '@copilotkit/react-core';
import React, { memo, useEffect } from 'react';

import EmbeddedAssistent from '@/components/EmbeddedAssistent/EmbeddedAssistent';

import { examSummary } from './components/ExamUtils';
import { useGlobalContext } from '@/components/GlobalContext';
import CustomMessages from '@/components/EmbeddedAssistent/CustomMessages';

const Page = memo(() => {
  const { subscribe, publish } = useGlobalContext();
  // useMakeCopilotReadable(JSON.stringify({ examSummary: examSummary }));

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
    <CopilotKit url='/api/copilotkit/openai'>
      <div>
        <h1 className='text-center mt-5 mb-5'>Story time!</h1>
        <EmbeddedAssistent
          id='story_assistant'
          instructions={instructions}
          customMessageComponent={(props) => {
            return (
              <CustomMessages
                {...props}
                hideUserMessages={true}
                onlyShowLastAssistantMessage={true}
                spinner={
                  <div className='text-center'>
                    <i className='fa fa-spinner fa-spin fa-3x'></i>
                  </div>
                }
                AssistantMessageComponent={({ message }) => (
                  <div>
                    {message.content}
                    <br />
                    {message.name}
                    <br />
                    {message.ui}
                    <br />
                    {message.role}
                  </div>
                )}
              />
            );
          }}
        />
      </div>
    </CopilotKit>
  );
});
export default Page;

const instructions = `
gg""
`;
