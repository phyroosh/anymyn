import React from 'react';
import { Audio, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { THEME } from './theme';
import { StudioGridBackground } from './StudioGridBackground';
import { Shot1TheMoneyV5 } from './Shot1TheMoneyV5';
import { Shot2WhatItBuysV5 } from './Shot2WhatItBuysV5';
import { Shot3TimePassesV5 } from './Shot3TimePassesV5';
import { Shot4TheSameBasketV5 } from './Shot4TheSameBasketV5';
import { Shot5TheRealizationV5 } from './Shot5TheRealizationV5';
import { Shot6TheConclusionV5 } from './Shot6TheConclusionV5';

export const TheInvisibleCostV5Master: React.FC = () => {
  const frame = useCurrentFrame();

  // Subtle continuous camera drift across the entire 69-second piece
  const cameraPanX = interpolate(
    frame,
    [0, 540, 1050, 1500, 2070],
    [0, 12, -8, 10, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const cameraPanY = interpolate(
    frame,
    [0, 1050, 2070],
    [0, -6, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const lightFocusX = interpolate(
    frame,
    [0, 1050, 2070],
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

      {/* 2. Master Audio Track (-16.5 LUFS Normalized Master) */}
      <Audio src={staticFile('audio/the-invisible-cost-v5/master_audio.mp3')} />

      {/* 3. Sequence of Transparent Foreground Scenes */}
      {/* Shot 1: The Money (Frames 0 - 240 / 0.0s - 8.0s) */}
      <Sequence from={0} durationInFrames={240}>
        <Shot1TheMoneyV5 />
      </Sequence>

      {/* Shot 2: What It Buys (Frames 240 - 540 / 8.0s - 18.0s) */}
      <Sequence from={240} durationInFrames={300}>
        <Shot2WhatItBuysV5 />
      </Sequence>

      {/* Shot 3: Time Passes (Frames 540 - 1050 / 18.0s - 35.0s) */}
      <Sequence from={540} durationInFrames={510}>
        <Shot3TimePassesV5 />
      </Sequence>

      {/* Shot 4: The Same Basket (Frames 1050 - 1410 / 35.0s - 47.0s) */}
      <Sequence from={1050} durationInFrames={360}>
        <Shot4TheSameBasketV5 />
      </Sequence>

      {/* Shot 5: The Realization (Frames 1410 - 1770 / 47.0s - 59.0s) */}
      <Sequence from={1410} durationInFrames={360}>
        <Shot5TheRealizationV5 />
      </Sequence>

      {/* Shot 6: The Conclusion (Frames 1770 - 2070 / 59.0s - 69.0s) */}
      <Sequence from={1770} durationInFrames={300}>
        <Shot6TheConclusionV5 />
      </Sequence>
    </div>
  );
};
