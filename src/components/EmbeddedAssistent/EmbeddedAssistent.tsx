import { CopilotSidebar } from '@copilotkit/react-ui';
import React from 'react';

import styles from './EmbeddedAssistent.module.css';

import { Input } from '@/components/ai-sidebar/Input';

import CustomMessages, { MessagesProps } from './CustomMessages';

const EmbeddedAssistent = (props: {
  id: string;
  instructions: string;
  firstMessage?: string;
  enableVoice?: boolean;
  customMessageComponent?: React.ComponentType<MessagesProps>;
}): JSX.Element => {
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
          />
        )}
        Messages={
          renderMessageReceiver(!!props.enableVoice, props.customMessageComponent)
        }
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

function renderMessageReceiver(enableVoice: boolean, CustomMessageComponent: React.ComponentType<MessagesProps> | undefined) {
  if (CustomMessageComponent) {
    return (props3: MessagesProps) => <CustomMessageComponent {...props3} />;
  }
  
  if (!enableVoice) {
    return undefined;
  }

  return (props3: MessagesProps) => (
    <CustomMessages inProgress={props3.inProgress} messages={props3.messages} />
  );
}

export default React.memo(EmbeddedAssistent);
