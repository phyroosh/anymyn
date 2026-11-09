import React from 'react';
import { Audio, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { THEME } from './theme';
import { StudioGridBackground } from './StudioGridBackground';
import { Shot1TwoPlinths } from './Shot1TwoPlinths';
import { Shot2BaselineBudget } from './Shot2BaselineBudget';
import { Shot3TheRaise } from './Shot3TheRaise';
import { Shot4LifestyleCreep } from './Shot4LifestyleCreep';
import { Shot5UnchangedVault } from './Shot5UnchangedVault';
import { Shot6TheResolution } from './Shot6TheResolution';

export const TheSalaryTrapMaster: React.FC = () => {
  const frame = useCurrentFrame();

  // Subtle continuous camera drift across the entire 52-second documentary piece
  const cameraPanX = interpolate(
    frame,
    [0, 420, 840, 1260, 1560],
    [0, 10, -8, 8, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const cameraPanY = interpolate(
    frame,
    [0, 780, 1560],
    [0, -5, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const lightFocusX = interpolate(
    frame,
    [0, 780, 1560],
    [48, 52, 50],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        width: THEME.layout.width,
        height: THEME.layout.height,
        backgroundColor: THEME.colors.bgWall,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 1. Persistent Studio Perspective Grid & Horizon Mounted ONCE at Master Level */}
      <StudioGridBackground
        cameraPanX={cameraPanX}
        cameraPanY={cameraPanY}
        lightFocusX={lightFocusX}
      />

      {/* 2. Master Audio Track (-16.5 LUFS Normalized Master with ElevenLabs Voice Lead) */}
      <Audio src={staticFile('audio/the-salary-trap/master_audio.mp3')} />

      {/* 3. Sequence of Transparent Foreground Scenes */}
      {/* Shot 1: The Paradox of the Two Plinths (Frames 0 - 165 / 0.0s - 5.5s) */}
      <Sequence from={0} durationInFrames={165}>
        <Shot1TwoPlinths />
      </Sequence>

      {/* Shot 2: The Baseline Blueprint (Frames 165 - 420 / 5.5s - 14.0s) */}
      <Sequence from={165} durationInFrames={255}>
        <Shot2BaselineBudget />
      </Sequence>

      {/* Shot 3: The Raise Arrives (Frames 420 - 645 / 14.0s - 21.5s) */}
      <Sequence from={420} durationInFrames={225}>
        <Shot3TheRaise />
      </Sequence>

      {/* Shot 4: The Creep: Three Silent Upgrades (Frames 645 - 1020 / 21.5s - 34.0s) */}
      <Sequence from={645} durationInFrames={375}>
        <Shot4LifestyleCreep />
      </Sequence>

      {/* Shot 5: The Climax: The Unchanged Vault (Frames 1020 - 1260 / 34.0s - 42.0s) */}
      <Sequence from={1020} durationInFrames={240}>
        <Shot5UnchangedVault />
      </Sequence>

      {/* Shot 6: The Verdict & The 50/50 Rule (Frames 1260 - 1560 / 42.0s - 52.0s) */}
      <Sequence from={1260} durationInFrames={300}>
        <Shot6TheResolution />
      </Sequence>
    </div>
  );
};
