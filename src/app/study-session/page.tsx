'use client';
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { CopilotSidebar } from '@copilotkit/react-ui';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Input } from '@/components/ai-sidebar/Input';

import { Editor } from './components/Editor';
import PomodoroCounter from './components/PomodoroCounter';

export default function Page() {
  const [webSiteLoaded, setWebSiteLoaded] = useState(false);
  const [assistenIsOpen, setAssistenIsOpen] = useState(true);
  const [content, setContent] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    setWebSiteLoaded(true);
    getContent().then((value) => setContent(value));
  }, []);

  if (!webSiteLoaded) {
    return <div></div>;
  }

  return (
    <div>
      <Assistent onToogle={setAssistenIsOpen} />
      <div className='fixed w-28 bottom-1 left-1'>
        <PomodoroCounter onEnd={() => router.push('/go')} />
      </div>
      <div
        style={{
          width: `calc(100% - ${assistenIsOpen ? 500 : 80}px)`,
          marginRight: assistenIsOpen ? 500 : 'auto',
          height: "550px",
          overflowY: "auto",
          marginTop: "60px",
        }}
        className='p-4 mt-8 max-w-3xl mx-auto'
      >
        <Editor content={content} key={content.substring(0, 10)} />
      </div>
    </div>
  );
}

function Assistent(props: { onToogle: (open: boolean) => void }) {
  const CustomInput = (props: any) => {
    return (
      <Input
        inProgress={props.inProgress}
        id='5'
        onSend={(text) => {
          props.onSend(text);
        }}
      />
    );
  };
  return (
    /* @ts-ignore */
    <div style={{ '--copilot-kit-primary-color': '#7D5BA6' }}>
      <CopilotSidebar
        key={7}
        labels={{title:"AI Assistent", initial:"Hey, let's study together. You memorize and I help you understand :)"}}
        defaultOpen={true}
        Input={CustomInput}
        clickOutsideToClose={false}
        onSetOpen={props.onToogle}
      />
    </div>
  );
}

async function getContent() {
  const urlParams = new URLSearchParams(window.location.search);
  const fileName = urlParams.get('file');

  if (!fileName) {
    console.error('No file parameter in the URL');
    return '';
  }

  const response = await fetch(
    `/api/markdown?filename=${encodeURIComponent(
      fileName.replace('-title', '')
    )}`
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json = await response.json();
  return json.data;
}
