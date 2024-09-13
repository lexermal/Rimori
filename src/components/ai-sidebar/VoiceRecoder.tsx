import hark from 'hark';
import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { FaMicrophone } from 'react-icons/fa6';

interface Props {
  onVoiceRecorded?: (message: string) => void;
  isDisabled?: boolean;
}

let mediaRecorder: MediaRecorder;
let audioChunks: { data: Blob; timespamp: number }[] = [];
let speechEventHandler: hark.Harker;

const VoiceRecorder = forwardRef((props: Props, ref) => {
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
      // init chunks are needed as it seems to be the file header
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
    //TODO: improve audio recording
    // disabled audio play for demo
    // audio.play();
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
    //increased interval from 50 for demo
    const speechEvents = hark(stream, { interval: 150 });

    speechEventHandler = speechEvents;
    //TODO: improve recording by also allowing continuous chitchatting with assistant without stopping hark
    //The lines in this function are disabled for demo and allow a push-to-talk recording with automatic stopping, also a convenient feature

    // speechEvents.on('speaking', () => {
    console.log('Speaking...');

    if (mediaRecorder.state === 'inactive') {
      mediaRecorder.start();
    }

    voiceStartTimestampRef.current = Date.now();
    console.log('Voice start timestamp: ', voiceStartTimestampRef);
    // });
    // speechEvents.on('stopped_speaking', () => {
    //   console.log('Silence detected...');
    //   if (mediaRecorder.state === 'recording') {
    //     mediaRecorder.stop();

    //     //temporary stop recording for demo
    //     //TODO improve recording
    //     setTimeout(() => {
    //       stopRecordingSession();
    //       console.log('Recording stopped...');
    //     }, 500);
    //   }
    // });
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
    // mediaRecorder.start();
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
    // audioChunks = []; //bug and interfering with recording functionaloty on exam session. to be checked if neededs
  };

  useImperativeHandle(ref, () => ({
    startRecording: startRecordingSession,
    stopRecording: stopRecordingSession,
  }));

  return (
    <div>
      <button
        disabled={props.isDisabled}
        onClick={isRecording ? stopRecordingSession : startRecordingSession}>
        <FaMicrophone className={"h-7 w-7 mr-2 " + (isRecording ? "text-red-600" : "")} />
      </button>
    </div>
  );
});

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
