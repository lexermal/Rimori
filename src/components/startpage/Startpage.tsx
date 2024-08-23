'use client';

import { Spinner } from 'flowbite-react';
import { useEffect, useState } from 'react';

import { useRouter } from '@/i18n';
import DocumentSelection from '@/components/startpage/DocumentSelection';
import { FileUpload } from '@/components/startpage/FileUpload';
import { useUser } from '@/hooks/useUser';


export interface MarkdownDocument {
  id: string;
  name: string;
  content: string;
  topics?: string[];
}

const StartPage = (props: { uploadBackend: string }) => {
  const [documents, setDocuments] = useState<MarkdownDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedFile, setSelectedFile] = useState<string>('');

  const router = useRouter();
  const { user } = useUser();
  // @ts-ignore
  const jwt = user?.jwt;

  const fetchDocuments = async (refreshIndex?: boolean) => {
    fetch('/api/appwrite/documents?onlyTitle=true' + (refreshIndex ? "&refresh=true" : ""), { headers: { Authorization: `Bearer ${jwt}` } })
      .then((response) => response.json())
      .then((data) => {
        console.log('Data:', data);
        setDocuments(data.data || []);
        setLoading(false);
      });
  }

  useEffect(() => {
    if (!jwt) {
      return;
    }

    fetchDocuments();
  }, [jwt]);

  return (
    <div className='pb-16'>
      {loading && (
        <div className='text-center'>
          <Spinner className='h-24 w-24 mt-64' />
        </div>
      )}
      <div className='w-2/4 mx-auto'>
        {!loading && <h2 className='text-center mb-5'>
          Study documents
        </h2>}
        {Object.keys(documents).length > 0 && (
          <DocumentSelection
            onSelected={(id) => setSelectedFile(id)}
            items={documents}
            onNewDocument={() => router.push('/study-session?file=new')}
          />
        )}
      </div>
      {!loading && (
        <FileUpload
          backendEndoint={props.uploadBackend}
          jwt={jwt}
          onFileUpload={() => true}
          onFilesUploaded={() => {
            fetchDocuments(true);
          }}
        />
      )}
      {selectedFile && <TrainingButtons selectedFile={selectedFile} />}
    </div>
  );
};

function TrainingButtons({ selectedFile }: any) {
  // router for pushing to the next page
  const router = useRouter();

  const buttons = [
    // {
    //   text: 'Study Session',
    //   onClick: () => router.push(`/study-session?file=${selectedFile}`),
    // },
    {
      text: 'Opposition',
      onClick: () => router.push(`/discussion?file=${selectedFile}`),
    },
    {
      text: 'Story',
      onClick: () => router.push(`/story?file=${selectedFile}`),
    },
  ];

  return (
    <div className='fixed bottom-0 right-0 left-0 h-36 bg-gray-500 p-3 flex justify-center items-center space-x-10'>
      {buttons.map((button, index) => (
        <button
          key={index}
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold text-xl py-8 px-12 rounded-lg border-2 border-white'
          onClick={button.onClick}
        >
          {button.text}
        </button>
      ))}
    </div>
  );
}

export default StartPage;
