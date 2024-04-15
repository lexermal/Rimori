import hark from 'hark';
import React, { useRef, useState } from 'react';

interface Props {
  onVoiceRecorded?: (message: string) => void;
}

let mediaRecorder: MediaRecorder;
let audioChunks: { data: Blob; timespamp: number }[] = [];

function VoiceRecorder(props: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const voiceStartTimestampRef = useRef(0);

  const handleDataAvailable = (e: BlobEvent) => {
    console.log('Chunks get saved...');

    audioChunks.push({ data: e.data, timespamp: Date.now() });
  };

  const handleStop = async () => {
    console.log('Recording stopped.');
    const startTimestamp = voiceStartTimestampRef.current;
    const startChunkIndex = audioChunks.findIndex(
      (chunk) => chunk.timespamp > startTimestamp,
    );
    console.log('Start chunk index: ', startChunkIndex);
    console.log('Audio chunks amount: ', audioChunks.length);

    if (startChunkIndex > 2) {
      // init chunks are needed as it seams to be the file header
      // without the audio data won't be playable
      const initChunks = audioChunks.slice(0, 2);
      const laterChunks = audioChunks.slice(startChunkIndex - 4);

      audioChunks = initChunks.concat(laterChunks);
    }

    const audioBlob = new Blob(audioChunks.map((chunk) => chunk.data));

    // Send the audio blob to the server
    whisperRequestSTT(audioBlob).then((text) => {
      console.log(text);
      props.onVoiceRecorded?.(text);
    });

    audioChunks = []; // Clear the audio chunks

    // play the blob
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  };

  function triggerChunkFetching() {
    if (mediaRecorder.state !== 'inactive') {
      mediaRecorder.requestData();
      // console.log('Fetching chunks...');
    }
    setTimeout(() => {
      triggerChunkFetching();
    }, 100);
  }

  const startRecording = async () => {
    console.log('Start recording...');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm',
      audioBitsPerSecond: 128000,
    });
    const speechEvents = hark(stream, { interval: 50 });

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

    triggerChunkFetching();
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
}

export default VoiceRecorder;

const whisperRequestSTT = async (audioFile: Blob) => {
  const formData = new FormData();
  formData.append('file', audioFile, 'audio.wav');

  return fetch('/api/stt', {
    method: 'POST',
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => data.text);
};
