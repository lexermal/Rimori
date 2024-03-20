import hark from 'hark';
import React, { useRef, useState } from 'react';

let mediaRecorder: MediaRecorder;
let audioChunks: Blob[] = [];

const VoiceRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const voiceStartTimestampRef = useRef(0);

  const handleDataAvailable = (e: BlobEvent) => {
    console.log('Chunks get saved...');

    audioChunks.push(e.data);
  };

  const handleStop = async () => {
    console.log('Recording stopped.');
    const endingTimestamp = Date.now();
    const durationToRemove = endingTimestamp - voiceStartTimestampRef.current;

    const audioBlob = new Blob(audioChunks);

    // console.log('Audio blob before removing silence: ', audioBlob);

    // Remove silence from the audio blob

    // console.log('Audio blob after removing silence: ', newBlob);
    // Send the audio blob to the server
    whisperRequestSTT(audioBlob, durationToRemove).then((text) => {
      console.log(text);
    });

    audioChunks = []; // Clear the audio chunks

    // play the blob
    // const audioUrl = URL.createObjectURL(newBlob);
    // const audio = new Audio(audioUrl);
    // audio.play();
    // Trigger your function here with the audioBlob
  };

  const startRecording = async () => {
    console.log('Start recording...');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    const speechEvents = hark(stream, { interval: 100 });

    speechEvents.on('speaking', () => {
      console.log('Speaking...');

      if (mediaRecorder.state === 'inactive') {
        mediaRecorder.start();
      }

      voiceStartTimestampRef.current = Date.now();
      console.log('Voice start timestamp: ', voiceStartTimestampRef);
    });
    speechEvents.on('stopped_speaking', () => {
      console.log('Silence detected...');
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    });
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    console.log('Stop recording...');
    if (mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    setIsRecording(false);
  };

  return (
    <div>
      <button onClick={startRecording} disabled={isRecording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        Stop Recording
      </button>
    </div>
  );
};

export default VoiceRecorder;

const whisperRequestSTT = async (audioFile: Blob, durationToRemove: number) => {
  const formData = new FormData();
  formData.append('file', audioFile, 'audio.wav');
  formData.append('durationToRemove', durationToRemove.toString());

  return fetch('/api/stt', {
    method: 'POST',
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => data.text);
};
