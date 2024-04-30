'use client';

import React, { InputHTMLAttributes, useEffect, useState } from 'react';
import { DropzoneRootProps, useDropzone } from 'react-dropzone';
import { CustomNavbar } from './components/Navbar';
import DocumentSelection from './components/DocumentSelection';

const MyDropzone: React.FC = () => {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    multiple: true,
    onDragEnter: () => console.log('onDragEnter'),
    onDragOver: () => console.log('onDragOver'),
    onDragLeave: () => console.log('onDragLeave'),
    accept: {
      'application/pdf': [],
    },
  });
  console.log('acceptedFiles:', acceptedFiles);

  //useeffect that uploads the file to /api/upload

  useEffect(() => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('file', file);
      fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Success:', data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  }, [acceptedFiles]);

  return (
    <div>
      <div className='bg-blue-300' {...(getRootProps() as DropzoneRootProps)}>
        <input
          {...(getInputProps() as InputHTMLAttributes<HTMLInputElement>)}
        />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      <DocumentSelection onSelected={(id) => console.log(id)} items={
        {
          'Accordion 1': ['Entry 1', 'Entry 2'],
          'Accordion 2': ['Entry 1', 'Entry 2', 'Entry 3'],
        }
      
      } />
      <ul>
        {acceptedFiles.map((file) => (
          <li key={file.name}>
            {file.name} - {file.size} bytes
          </li>
        ))}
      </ul>
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
