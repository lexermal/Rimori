'use client';

import { Spinner } from 'flowbite-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import DocumentSelection from './components/DocumentSelection';
import { FileUpload } from './components/FileUpload';

const Page: React.FC = () => {
  const [documents, setDocuments] = useState<{ [key: string]: string[] }>({});
  const [loading, setLoading] = useState(true);

  const [selectedFile, setSelectedFile] = useState<string>('');

  const router = useRouter();

  useEffect(() => {
    //page might have set parameter ?empty  if not set load files from /api/files
    if (window.location.search !== '?empty') {
      fetch('/api/files')
        .then((response) => response.json())
        .then((data) => {
          const newDocuments = {} as any;
          data.allFiles.forEach((file: string) => {
            newDocuments[file] = [];
          });
          setDocuments(newDocuments);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className='pb-40'>
      {loading && (
        <div className='text-center'>
          <Spinner className='h-24 w-24 mt-64' />
        </div>
      )}
      {Object.keys(documents).length === 0 && !loading && (
        <FileUpload
          onFileUpload={() => true}
          onFilesUploaded={(fileNames) => {
            console.log('Files uploaded:', fileNames);
            const newObject = {} as any;
            fileNames.forEach((fileName) => {
              newObject[fileName] = [];
            });
            setDocuments(newObject);
          }}
        />
      )}
      <div className='w-2/4 mx-auto pt-28'>
        <h2 className='text-center mb-5'>
          {Object.keys(documents).length === 0 ? '' : 'Study documents'}
        </h2>
        {Object.keys(documents).length > 0 && (
          <DocumentSelection
            onSelected={(id) => setSelectedFile(id)}
            items={documents}
            onNewDocument={() => router.push('/study-session?file=new')}
          />
        )}
        {/* <p className='mt-2 text-gray-400 font-bold'>
          {Object.keys(documents).length === 0
            ? ''
            : 'Select one document to start training!'}
        </p> */}
      </div>
      {selectedFile && <TrainingButtons selectedFile={selectedFile} />}
    </div>
  );
};

function TrainingButtons({ selectedFile }: any) {
  // router for pushing to the next page
  const router = useRouter();

  const buttons = [
    {
      text: 'Study Session',
      onClick: () => router.push(`/study-session?file=${selectedFile}`),
    },
    {
      text: 'Opposition',
      onClick: () => router.push(`/discussion?file=${selectedFile}`),
    },
    // {
    //   text: 'Story',
    //   onClick: () => router.push(`/story?file=${selectedFile}`),
    // },
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
      <button
        key={5}
        className='bg-blue-500 text-white font-bold text-lg py-4 px-10 rounded-lg border-2'
        style={{ height: '95px' }}
        disabled={true}
      >
        Story <br /> (Coming Soon)
      </button>
    </div>
  );
}

export default Page;
