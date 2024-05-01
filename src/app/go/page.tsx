'use client';

import { useState } from 'react';

import DocumentSelection from './components/DocumentSelection';
import { FileUpload } from './components/FileUpload';

const Page: React.FC = () => {
  const [documents, setDocuments] = useState<{ [key: string]: string[] }>({});

  const [selectedFile, setSelectedFile] = useState<string>('');

  return (
    <div>
      <FileUpload
        onFileUpload={(fileNames) => {
          // const documentCopy = { ...documents };
          // fileNames.forEach((fileName) => {
          //   documentCopy[fileName] = [];
          // });
          // setDocuments(documentCopy);
        }}
        onFilesUploaded={(fileNames) => {
          console.log('Files uploaded:', fileNames);
          const newObject = {} as any;
          fileNames.forEach((fileName) => {
            newObject[fileName] = [];
          });
          setDocuments(newObject);
        }}
      />
      <div className='w-2/4 mx-auto'>
        <h1 className='text-center'>
          {Object.keys(documents).length === 0 ? '' : 'Documents'}
        </h1>
        <DocumentSelection
          onSelected={(id) => setSelectedFile(id)}
          items={documents}
        />
      </div>
      {selectedFile && <TrainingButtons selectedFile={selectedFile} />}
    </div>
  );
};

function TrainingButtons({ selectedFile }: any) {
  const enableButtons = selectedFile !== '';

  console.log('enableButtons:', enableButtons);
  return (
    <div className='absolute bottom-0 right-0 left-0 h-36 bg-red-300'>
      <button
        disabled={!enableButtons}
        onClick={() => console.log('Training button clicked')}
      >
        Discussion
      </button>
      <button
        disabled={!enableButtons}
        onClick={() => console.log('Training button clicked')}
      >
        Story
      </button>
      <button disabled={true}>Summary Creation</button>
      <button disabled={true}>Flashcard Generation (coming soon)</button>
    </div>
  );
}

export default Page;
