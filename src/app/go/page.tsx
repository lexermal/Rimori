'use client';

import { useState } from 'react';

import DocumentSelection from './components/DocumentSelection';
import { FileUpload } from './components/FileUpload';
import { CustomNavbar } from './components/Navbar';

const MyDropzone: React.FC = () => {
  const [documents, setDocuments] = useState<{ [key: string]: string[] }>({});

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
          const newObject={} as any;
          fileNames.forEach((fileName) => {
            newObject[fileName] = [];
          });
          setDocuments(newObject);
        }}
      />
      <DocumentSelection
        onSelected={(id) => console.log(id)}
        items={documents}
      />
    </div>
  );
};

const Page: React.FC = () => (
  <div>
    <CustomNavbar />

    <div>
      <MyDropzone />
    </div>
  </div>
);

export default Page;
