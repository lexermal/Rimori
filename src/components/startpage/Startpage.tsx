'use client';

import { Spinner } from 'flowbite-react';
import { useEffect, useState } from 'react';

import { useRouter } from '@/i18n';
import DocumentSelection from '@/components/startpage/DocumentSelection';
import { FileUpload } from '@/components/startpage/FileUpload';
import { createClient } from '@/utils/supabase/server';
import EmitterSingleton from '@/app/[locale]/(auth-guard)/discussion/components/Emitter';

export interface MarkdownDocument {
  id: string;
  name: string;
  content: string;
  topics?: string[];
}

export interface DocumentStatus {
  document_id: string;
  document_name: string;
  section_id: string;
  section_heading: string;
  heading_level: number;
  content_index: number;
}

const StartPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [documents, setDocuments] = useState<DocumentStatus[]>([]);

  const router = useRouter();
  const supabase = createClient();

  const fetchDocuments = async () => {
    const { data, error } = await supabase.rpc('get_real_headings')

    if (error) console.error('Failed to retrieve documents:', error);

    // console.log('data', data);

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
            onSelected={(id) => {
              if (!id.includes("_")) {
                const availableDocuments = documents.filter(d => d.document_id == id && d.section_id != id);
                const randomdocument = availableDocuments[Math.floor(Math.random() * availableDocuments.length)];
                id = id + "_" + randomdocument.section_id;
                console.log("id", id);
              }
              setSelectedFile(id);
            }}
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
    {
      text: 'Study Session',
      onClick: () => {
        EmitterSingleton.emit('analytics-event', { name: 'Study Session' });
        router.push(`/study-session?file=${selectedFile}`);
      },
      enabled: false
    },
    {
      text: 'Opposition',
      onClick: () => {
        EmitterSingleton.emit('analytics-event', { name: 'Opposition' });
        router.push(`/discussion?file=${selectedFile}`);
      },
      enabled: true
    },
    {
      text: 'Story',
      onClick: () => {
        EmitterSingleton.emit('analytics-event', { name: 'Story' });
        router.push(`/story?file=${selectedFile}`);
      },
      enabled: true
    },
    {
      text: "Exam simulation",
      onClick: () => {
        EmitterSingleton.emit('analytics-event', { name: 'Exam simulation' });
        router.push(`/exam-session?file=${selectedFile}`);
      },
      enabled: true //Todo remove this line
      // enable on 20.09.2024 by using date comparison
      // enabled: new Date() > new Date('2024-09-20'),
    },
  ];

  return (
    <div className='pb-16'>
      <div className='fixed bottom-0 right-0 left-0 h-36 bg-gray-500 p-3 flex justify-center items-center space-x-10'>
        {buttons.filter((button) => button.enabled).map((button, index) => (
          <button
            key={index}
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold text-xl h-24 w-48 rounded-lg border-2 border-white'
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
