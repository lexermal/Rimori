'use client';

import { Spinner } from 'flowbite-react';
import { useEffect, useState } from 'react';

import { useRouter } from '@/i18n';
import DocumentSelection from '@/components/startpage/DocumentSelection';
import { FileUpload } from '@/components/startpage/FileUpload';
import { createClient } from '@/utils/supabase/server';


export interface MarkdownDocument {
  id: string;
  name: string;
  content: string;
  topics?: string[];
}

export interface DocumentStatus {
  id: string;
  name: string;
  status: string;
}

const StartPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [documents, setDocuments] = useState<DocumentStatus[]>([]);

  const router = useRouter();
  const supabase = createClient();

  const fetchDocuments = async () => {
    const { data, error } = await supabase.from('documents').select('id,name,status')

    if (error) console.error('Failed to retrieve documents:', error);

    setDocuments(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchDocuments();
  }, []);

  if (loading) {
    return (
      <div className='text-center'>
        <Spinner className='h-24 w-24 mt-64' />
      </div>
    );
  }

  return (
    <div className='pb-16 pt-6'>
      <div className='w-2/4 mx-auto'>
        <h2 className='text-center mb-5'>
          Study documents
        </h2>
        {documents.length > 0 && (
          <DocumentSelection
            onSelected={(id) => setSelectedFile(id)}
            items={documents}
            onNewDocument={() => router.push('/study-session?file=new')}
          />
        )}
      </div>
      <FileUpload
        onFileUpload={() => true}
        onFilesUploaded={() => {
          fetchDocuments();
        }}
      />
      {selectedFile && <TrainingButtons selectedFile={selectedFile} />}
    </div>
  );
};

function TrainingButtons({ selectedFile }: any) {
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
    {
      text: 'Speaking exam',
      onClick: () => router.push(`/exam-session?file=${selectedFile}`),
    },
  ];

  return (
    <div className='pb-16'>
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
    </div>
  );
}

export default StartPage;
