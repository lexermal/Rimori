import { useCopilotAction } from '@copilotkit/react-core';
import { FrontendAction } from '@copilotkit/react-core/dist/types/frontend-action';
import { CopilotSidebar } from '@copilotkit/react-ui';
import React from 'react';

import styles from './EmbeddedAssistent.module.css';

import { Input } from '@/components/ai-sidebar/Input';

import CustomMessages, { MessagesProps } from './CustomMessages';
import { VoiceId } from './Voice/TTS';

const EmbeddedAssistent = (props: {
  ttsAPIkey: string;
  id: string;
  instructions: string;
  firstMessage?: string;
  customMessageComponent?: React.ComponentType<MessagesProps>;
  actions?: FrontendAction[];
  voiceId?: VoiceId;
}): JSX.Element => {
  const [voiceEnabled, setVoiceEnabled] = React.useState(true);
  // console.log('voiceEnabled: ', voiceEnabled);

  props.actions &&
    props.actions.forEach((action) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useCopilotAction(action);
    });

  return (
    <div>
      <CopilotSidebar
        labels={{ initial: props.firstMessage }}
        defaultOpen={true}
        className={styles.supress}
        Header={() => <div />}
        Button={() => <div />}
        Input={(props2) => (
          <Input
            id={props.id}
            inProgress={props2.inProgress}
            onSend={props2.onSend}
            otherFeatures={
              <RenderSpeaker
                voiceEnabled={voiceEnabled}
                toggleVoice={() => setVoiceEnabled(!voiceEnabled)}
              />
            }
          />
        )}
        Messages={renderMessageReceiver(
          props.ttsAPIkey,
          voiceEnabled,
          props.customMessageComponent,
          props.firstMessage && props.firstMessage,
          props.voiceId
        )}
        hitEscapeToClose={false}
        clickOutsideToClose={false}
        showResponseButton={false}
        instructions={props.instructions}
        makeSystemMessage={(contextString: string, instructions?: string) => {
          // console.log('contextString: ', contextString);
          // console.log('instructions: ', instructions);

          return (
            instructions +
            `

            The user has provided you with the following context:
\`\`\`
${contextString}
\`\`\`

The user have also provided you with functions you can call to initiate actions on their behalf.

Please assist them as best you can.

This is not a conversation, so please do not ask questions. Just call a function without saying anything else.
          `
          );
        }}
      />
    </div>
  );
};

function RenderSpeaker(props: {
  voiceEnabled: boolean;
  toggleVoice: () => void;
}) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 640 512'
      style={{ fill: props.voiceEnabled ? 'rgb(56 116 181)' : 'black' }}
      className={'h-7 mr-2 cursor-pointer '}
      onClick={props.toggleVoice}
    >
      {/* <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--> */}
      <path d='M533.6 32.5C598.5 85.2 640 165.8 640 256s-41.5 170.7-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z' />
    </svg>
  );
}

function renderMessageReceiver(
  ttsAPIkey:string,
  enableVoice: boolean,
  CustomMessageComponent: React.ComponentType<MessagesProps> | undefined,
  initialMessage?: string,
  voiceId?: VoiceId
) {
  if (CustomMessageComponent) {
    return (props: MessagesProps) => (
      <CustomMessageComponent initialMessage={initialMessage} {...props} />
    );
  }

  return (props: MessagesProps) => (
    <CustomMessages
      inProgress={props.inProgress}
      messages={props.messages}
      enableVoice={enableVoice}
      initialMessage={initialMessage}
      voiceId={voiceId}
      ttsAPIKey={ttsAPIkey}
    />
  );
}

export default React.memo(EmbeddedAssistent);
