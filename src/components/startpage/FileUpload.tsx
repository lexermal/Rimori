"use client";

import { UPLOAD_BACKEND } from '@/utils/constants';
import { createClient } from '@/utils/supabase/server';
import { InputHTMLAttributes, useEffect, useState } from 'react';
import { DropzoneRootProps, useDropzone } from 'react-dropzone';

interface Props {
  onFileUpload: (fileNames: string[]) => void;
  onFilesUploaded: (fileNames: string[]) => void;
}

export function FileUpload(props: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [jwt, setJWT] = useState<string>('');
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    multiple: true,
    onDragEnter: () => console.log('onDragEnter'),
    onDragOver: () => console.log('onDragOver'),
    onDragLeave: () => console.log('onDragLeave'),
    accept: {
      'application/pdf': [],
    },
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then((session) => {
      setJWT(session.data.session!.access_token);
    }
    );
  }, []);

  useEffect(() => {
    if (acceptedFiles.length === 0) {
      return;
    }

    props.onFileUpload(acceptedFiles.map((file) => file.name));

    const formData = new FormData();
    acceptedFiles.forEach((file) => {
      formData.append('file', file);
    });

    setIsUploading(true);

    fetch(UPLOAD_BACKEND, {
      method: 'POST',
      body: formData,
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then((response) => response.json())
      .then((data) => {
        props.onFilesUploaded(data.allFiles);
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .then(() => setIsUploading(false));
  }, [acceptedFiles]);

  return (
    <div className='bg-blue-300 w-2/5 mt-7 mx-auto p-6 rounded-xl mb-10 cursor-pointer border-dashed border-4 border-spacing-8 border-purple-900 '
      {...(getRootProps() as DropzoneRootProps)}>
      <input {...(getInputProps() as InputHTMLAttributes<HTMLInputElement>)} />
      <p className='text-center'>{isUploading ? "Please wait..." : "Upload your documents here."}</p>
    </div>
  );
}
