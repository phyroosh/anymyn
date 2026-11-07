import React from 'react';
import { Composition } from 'remotion';
import { CompoundingCinematic } from './compositions/CompoundingCinematic';
import { CompoundingProof } from './compositions/CompoundingProof';
import { LookDevV2 } from './compositions/lookdev/LookDevV2';
import { LookDevV3 } from './compositions/lookdev3/LookDevV3';
import { LookDevV4 } from './compositions/lookdev4/LookDevV4';
import { TheCompoundEffectMaster } from './compositions/the-compound-effect/TheCompoundEffectMaster';
import { TheInvisibleCostMaster } from './compositions/the-invisible-cost/TheInvisibleCostMaster';
import { TheInvisibleCostV2Master } from './compositions/the-invisible-cost-v2/TheInvisibleCostV2Master';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 69.0-second Full Video Production: The Invisible Cost V2 (Simplified & Focused) */}
      <Composition
        id="TheInvisibleCostV2Master"
        component={TheInvisibleCostV2Master}
        durationInFrames={2070}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* 69.0-second Full Video Production: The Invisible Cost (V1 Original Backup) */}
      <Composition
        id="TheInvisibleCostMaster"
        component={TheInvisibleCostMaster}
        durationInFrames={2070}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* 14.0-second V4 Typography & Editing Overhaul (Mobile-Readable Monumental Motion Design) */}
      <Composition
        id="LookDevV4"
        component={LookDevV4}
        durationInFrames={420}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* 76.0-second Full Video Production: The Compound Effect (6 Distinct Cinematic Worlds) */}
      <Composition
        id="TheCompoundEffectMaster"
        component={TheCompoundEffectMaster}
        durationInFrames={2280}
        fps={30}
        width={1080}
        height={1920}
      />

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
