import { CopilotSidebar } from '@copilotkit/react-ui';

import styles from './EmbeddedAssistent.module.css';

import { Input } from '@/components/ai-sidebar/Input';

export default function EmbettedAssistent(props: {
  instructions: string;
  firstMessage: string;
}): JSX.Element {
  return (
    <div>
      <p>{props.firstMessage}</p>
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

          return instructions + '';
        }}
      />
    </div>
  );
}
