'use client';
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { CopilotSidebar } from '@copilotkit/react-ui';
import { Spinner } from 'flowbite-react';
import { useEffect, useState } from 'react';

import { Input } from '@/components/ai-sidebar/Input';

import { useUser } from '@/context/UserContext';
import { useRouter } from '@/i18n';

import { Editor } from './components/Editor';
import PomodoroCounter from './components/PomodoroCounter';

export default function Page() {
  const [webSiteLoaded, setWebSiteLoaded] = useState(false);
  const [assistantIsOpen, setAssistantIsOpen] = useState(true);
  const [content, setContent] = useState<string>('');
  const router = useRouter();

  const { user } = useUser();
  // @ts-ignore
  const jwt = user?.jwt;

  const getDocumentId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const documentId = urlParams.get('file');
    return documentId;
  }

  useEffect(() => {
    if (!jwt) {
      return;
    }

    getContent(jwt, getDocumentId()).then((value) => {
      setWebSiteLoaded(true);
      setContent(value);
    });
  }, [jwt]);

  if (!webSiteLoaded) {
    return (
      <div className='mx-auto w-20 mt-72'>
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div>
      <Assistant onToogle={setAssistantIsOpen} />
      <div className='fixed w-28 bottom-1 left-1'>
        <PomodoroCounter onEnd={() => router.push('/')} />
      </div>
      <div
        style={{
          width: `calc(100% - ${assistantIsOpen ? 500 : 80}px)`,
          marginRight: assistantIsOpen ? 500 : 'auto',
          height: '680px',
          overflowY: 'auto',
          padding: '5px',
          boxShadow: "0px 0px 25px 11px rgba(0,0,0,0.27)"
        }}
        className='p-4 max-w-3xl mx-auto rounded-lg overflow-hidden'
      >
        <Editor
          content={content}
          key={content.substring(0, 10)}
          onContentChange={(content) => {
            fetch("/api/appwrite/documents", {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': jwt
              },
              body: JSON.stringify({ content, documentId: getDocumentId() })
            }).then(response => response.json())
              .then(data => {
                console.log("Document updated", data);
              });
          }}
        />
      </div>
    </div>
  );
}

function Assistant(props: { onToogle: (open: boolean) => void }) {
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
        labels={{
          title: 'AI Assistant',
          initial:
            "Hey, let's study together. You memorize and I help you understand :)",
        }}
        defaultOpen={true}
        Input={CustomInput}
        clickOutsideToClose={false}
        onSetOpen={props.onToogle}
      />
    </div>
  );
}

async function getContent(jwt: string, documentId: string | null) {
  if (!documentId) {
    console.error('No file parameter in the URL');
    return '';
  }

  if (documentId === 'new') {
    // new file
    return '';
  }

  return getMarkdownContent(jwt, documentId);
}



async function getMarkdownContent(jwt: string, id: string) {
  return fetch("/api/appwrite/documents?documentId=" + id, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    }
  })
    .then(response => response.json())
    .then(data => {
      console.log("getMarkdownContent", data);
      return data.data[0].content;
    });
}

