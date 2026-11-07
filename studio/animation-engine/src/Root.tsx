import React from 'react';
import { Composition } from 'remotion';
import { CompoundingCinematic } from './compositions/CompoundingCinematic';
import { CompoundingProof } from './compositions/CompoundingProof';
import { LookDevV2 } from './compositions/lookdev/LookDevV2';
import { LookDevV3 } from './compositions/lookdev3/LookDevV3';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 14.0-second V3 Creative Evolution Test (4 Distinct Cinematic Shots) */}
      <Composition
        id="LookDevV3"
        component={LookDevV3}
        durationInFrames={420}
        fps={30}
        width={1080}
        height={1920}
      />

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
