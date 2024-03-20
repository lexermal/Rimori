"use client";
// pages/index.tsx
import type { NextPage } from 'next';
import VoiceRecorder from './VoiceRecoder';

const Home: NextPage = () => {
  return (
    <div>
      <VoiceRecorder />
    </div>
  );
};

export default Home;
