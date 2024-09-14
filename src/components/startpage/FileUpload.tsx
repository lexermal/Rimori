"use client";

import EmitterSingleton from '@/app/[locale]/(auth-guard)/discussion/components/Emitter';
import { useEnv } from '@/providers/EnvProvider';
import { SupabaseClient } from '@/utils/supabase/server';
import { InputHTMLAttributes, useEffect, useState } from 'react';
import { DropzoneRootProps, useDropzone } from 'react-dropzone';
import { FaUpload } from 'react-icons/fa6';

interface Props {
  onFileUpload: (fileNames: string[]) => void;
  onFilesUploaded: (fileNames: string[]) => void;
}

export function FileUpload(props: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    multiple: false,
    onDragEnter: () => console.log('onDragEnter'),
    onDragOver: () => console.log('onDragOver'),
    onDragLeave: () => console.log('onDragLeave'),
    accept: {
      'application/pdf': [],
    },
  });
  const env = useEnv();

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
    EmitterSingleton.emit('analytics-event', { category: 'File Upload', action: 'upload-init' });

    const supabase = SupabaseClient.getClient();
    supabase.auth.getSession().then(({ data }) => {
      fetch(env.UPLOAD_BACKEND, {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${data.session?.access_token}` },
      })
        .then((response) => response.json())
        .then((data) => {
          props.onFilesUploaded(data.allFiles);
          console.log('Success:', data);
          EmitterSingleton.emit('analytics-event', { category: 'File Upload', action: 'upload-success' });
        })
        .catch((error) => {
          EmitterSingleton.emit('analytics-event', { category: 'File Upload', action: 'upload-error', name: error.message ?? 'No error message provided!' });
          console.error('Error:', error);
        })
        .then(() => setIsUploading(false));
    });

  }, [acceptedFiles]);

  return (
    <div className='bg-blue-300 w-2/5 mt-7 mx-auto p-6 rounded-xl mb-10 cursor-pointer border-dashed border-4 border-spacing-8 border-purple-900 '
      {...(getRootProps() as DropzoneRootProps)}>
      <input {...(getInputProps() as InputHTMLAttributes<HTMLInputElement>)} />
      <div className='small'>{isUploading ? <FileUploadProgress /> : <div className='text-center flex flex-row'><FaUpload className='w-14 h-6' /><span>Upload your documents...</span></div>}</div>
    </div>
  );
}

function FileUploadProgress() {
  // progressbar that fills up over the next 60 seconds
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timeStart = Date.now();
    const timeEnd = timeStart + 3 * 60000;

    const interval = setInterval(() => {
      const now = Date.now();
      let progress = (now - timeStart) / (timeEnd - timeStart);

      if (progress > 0.95) {
        progress = 0.95;
      }

      setProgress(progress);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <p className='font-bold'>Processing your document...</p>
      <div className='relative h-2 bg-gray-300 rounded-lg'>
        <div className='absolute h-full bg-blue-500 rounded-lg' style={{ width: `${progress * 100}%` }}></div>
      </div>
      <p className='text-sm mt-3'>Meanwhile, you can study with other documents.</p>
    </div>
  );
}
