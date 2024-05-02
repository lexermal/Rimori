import hark from 'hark';
import React, { useRef, useState } from 'react';

interface Props {
  onVoiceRecorded?: (message: string) => void;
}

let mediaRecorder: MediaRecorder;
let audioChunks: { data: Blob; timespamp: number }[] = [];
let speechEventHandler: hark.Harker;

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
      (chunk) => chunk.timespamp > startTimestamp
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

  const startRecordingSession = async () => {
    console.log('Start recording...');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm',
      audioBitsPerSecond: 128000,
    });
    const speechEvents = hark(stream, { interval: 50 });

    speechEventHandler = speechEvents;

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

  const stopRecordingSession = () => {
    console.log('Stop recording session...');
    speechEventHandler.stop();
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach((track) => {
      track.stop();
    });
    mediaRecorder.ondataavailable = null;

    setIsRecording(false);
  };

  return (
    <div>
      <button
        onClick={isRecording ? stopRecordingSession : startRecordingSession}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 384 512'
          className='h-6 mr-2'
          style={{ fill: isRecording ? 'red' : 'black' }}
        >
          {/* <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--> */}
          <path d='M192 0C139 0 96 43 96 96V256c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h72 72c13.3 0 24-10.7 24-24s-10.7-24-24-24H216V430.4c85.8-11.7 152-85.3 152-174.4V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128s-128-57.3-128-128V216z' />
        </svg>
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
