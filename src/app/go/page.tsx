'use client';

import { useState } from 'react';

import DocumentSelection from './components/DocumentSelection';
import { FileUpload } from './components/FileUpload';

const Page: React.FC = () => {
  const [documents, setDocuments] = useState<{ [key: string]: string[] }>({});

  const [selectedFile, setSelectedFile] = useState<string>('');

  return (
    <div className='pb-40'>
      {Object.keys(documents).length === 0 && (
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
      <div className='w-2/4 mx-auto'>
        <h2 className='text-center'>
          {Object.keys(documents).length === 0 ? '' : 'Documents'}
        </h2>
        <DocumentSelection
          onSelected={(id) => setSelectedFile(id)}
          items={documents}
        />
        <p className='mt-5 text-gray-300 font-bold'>
          {Object.keys(documents).length === 0
            ? ''
            : 'Select one document to start training!'}
        </p>
      </div>
      {selectedFile && <TrainingButtons selectedFile={selectedFile} />}
    </div>
  );
};

function TrainingButtons({ selectedFile }: any) {
  const enableButtons = selectedFile !== '';

  console.log('enableButtons:', enableButtons);
  const buttons = [
    {
      text: 'Discussion',
      onClick: () => console.log('Training button clicked'),
      disabled: !enableButtons,
    },
    {
      text: 'Story',
      onClick: () => console.log('Training button clicked'),
      disabled: !enableButtons,
    },
    // { text: 'Summary Creation', disabled: true },
    // { text: 'Flashcard Generation', disabled: true },
  ];

  return (
    <div className='fixed bottom-0 right-0 left-0 h-36 bg-red-200 p-3 flex justify-center items-center space-x-10'>
      {buttons.map((button, index) => (
        <button
          key={index}
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold text-xl py-8 px-12 rounded-lg border-2'
          disabled={button.disabled}
          onClick={button.onClick}
        >
          {button.text}
        </button>
      ))}
      <button
        key={5}
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold text-lg py-4 px-10 rounded-lg border-2'
        style={{ height: '95px' }}
        disabled={true}
      >
        Summary Creation <br /> (Coming Soon)
      </button>
    </div>
  );
}

export default Page;
