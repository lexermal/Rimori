import { CopilotSidebar } from '@copilotkit/react-ui';

import styles from './EmbeddedAssistent.module.css';

import { Input } from '@/components/ai-sidebar/Input';

export default function EmbettedAssistent(props: {
  instructions: string;
  firstMessage: string;
}): JSX.Element {
  return (
    <div>
      {/* <p>{props.firstMessage}</p> */}
      <CopilotSidebar
        defaultOpen={true}
        className={styles.supress}
        Header={() => <div />}
        Button={() => <div />}
        Input={(props) => Input(props)}
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
}
