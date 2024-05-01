import { useEffect, InputHTMLAttributes } from 'react';
import { useDropzone, DropzoneRootProps } from 'react-dropzone';
interface Props {
  onFileUpload: (fileNames: string[]) => void;
  onFilesUploaded: (fileNames: string[]) => void;
}
export function FileUpload(props: Props) {
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
      props.onFileUpload(acceptedFiles.map((file) => file.name));

      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('file', file);
      fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          props.onFilesUploaded(data.allFiles);
          console.log('Success:', data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  }, [acceptedFiles]);

  return (
    <div className='bg-blue-300 w-2/5 mt-44 mx-auto p-16 rounded-xl mb-10 cursor-pointer border-dashed border-4 border-spacing-8 border-purple-900 ' {...(getRootProps() as DropzoneRootProps)}>
      <input {...(getInputProps() as InputHTMLAttributes<HTMLInputElement>)} />
      <p className='text-center'>Study documents in here!</p>
    </div>
  );
}
