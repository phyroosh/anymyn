import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { Scene1Hook } from './cinematic/Scene1Hook';
import { Scene2Parity } from './cinematic/Scene2Parity';
import { Scene3Inflection } from './cinematic/Scene3Inflection';
import { Scene4Surge } from './cinematic/Scene4Surge';
import { Scene5Verdict } from './cinematic/Scene5Verdict';

export const CompoundingCinematic: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#06080B',
        overflow: 'hidden',
      }}
    >
      {/* 1. Atmospheric Ambient Harmonic Drone Bed */}
      <Audio src={staticFile('audio/ambient_bed.mp3')} volume={0.45} />

      {/* 2. Main Narration Track (Paced at +18% rate) */}
      <Audio src={staticFile('audio/narration_v2.mp3')} volume={1.35} />

      {/* ========================================================= */}
      {/* 5 DISTINCT CINEMATIC SEQUENCES (Total: 810 frames / 27.0s) */}
      {/* ========================================================= */}

      {/* Scene 1: The Hook — Capital in Stillness (0.0s - 4.8s) */}
      <Sequence from={0} durationInFrames={145}>
        <Scene1Hook />
      </Sequence>

      {/* Scene 2: The Illusion of Parity — The First Decade (4.6s - 10.6s) */}
      <Sequence from={140} durationInFrames={180}>
        <Scene2Parity />
      </Sequence>

      {/* Scene 3: The Inflection Point — The Breakthrough (10.5s - 15.3s) */}
      <Sequence from={315} durationInFrames={145}>
        <Scene3Inflection />
      </Sequence>

      {/* Scene 4: The Exponential Surge — Escaping Orbit (15.1s - 21.0s) */}
      <Sequence from={455} durationInFrames={175}>
        <Scene4Surge />
      </Sequence>

      {/* Scene 5: The 30-Year Verdict & Core Principle (20.8s - 27.0s) */}
      <Sequence from={625} durationInFrames={185}>
        <Scene5Verdict />
      </Sequence>
    </AbsoluteFill>
  );
};
