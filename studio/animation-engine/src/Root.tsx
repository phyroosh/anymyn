import React from 'react';
import { Composition } from 'remotion';
import { CompoundingCinematic } from './compositions/CompoundingCinematic';
import { CompoundingProof } from './compositions/CompoundingProof';
import { LookDevV2 } from './compositions/lookdev/LookDevV2';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 9.5-second V2 Look-Development Test (3 Distinct Cinematic Experiences) */}
      <Composition
        id="LookDevV2"
        component={LookDevV2}
        durationInFrames={285}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* 27.0-second Multi-Scene Cinematic Benchmark (5 Distinct Sequences) */}
      <Composition
        id="CompoundingCinematic"
        component={CompoundingCinematic}
        durationInFrames={810}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* 9.33-second Single-Scene Technical Proof */}
      <Composition
        id="CompoundingProof"
        component={CompoundingProof}
        durationInFrames={280}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
