import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import { Shot1TheMoneyV2 } from './Shot1TheMoneyV2';
import { Shot2WhatItBuysV2 } from './Shot2WhatItBuysV2';
import { Shot3TimePassesV2 } from './Shot3TimePassesV2';
import { Shot4TheSameBasketV2 } from './Shot4TheSameBasketV2';
import { Shot5TheRealizationV2 } from './Shot5TheRealizationV2';
import { Shot6TheConclusionV2 } from './Shot6TheConclusionV2';

export const TheInvisibleCostV2Master: React.FC = () => {
  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: '#FAF8F2',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Master Audio Track (-16.5 LUFS Normalized Master) */}
      <Audio src={staticFile('audio/the-invisible-cost-v2/master_audio.mp3')} />

      {/* Shot 1: The Money (Frames 0 - 240 / 0.0s - 8.0s) */}
      <Sequence from={0} durationInFrames={240}>
        <Shot1TheMoneyV2 />
      </Sequence>

      {/* Shot 2: What It Buys (Frames 240 - 540 / 8.0s - 18.0s) */}
      <Sequence from={240} durationInFrames={300}>
        <Shot2WhatItBuysV2 />
      </Sequence>

      {/* Shot 3: Time Passes (Frames 540 - 1050 / 18.0s - 35.0s) */}
      <Sequence from={540} durationInFrames={510}>
        <Shot3TimePassesV2 />
      </Sequence>

      {/* Shot 4: The Same Basket (Frames 1050 - 1410 / 35.0s - 47.0s) */}
      <Sequence from={1050} durationInFrames={360}>
        <Shot4TheSameBasketV2 />
      </Sequence>

      {/* Shot 5: The Realization (Frames 1410 - 1770 / 47.0s - 59.0s) */}
      <Sequence from={1410} durationInFrames={360}>
        <Shot5TheRealizationV2 />
      </Sequence>

      {/* Shot 6: The Conclusion (Frames 1770 - 2070 / 59.0s - 69.0s) */}
      <Sequence from={1770} durationInFrames={300}>
        <Shot6TheConclusionV2 />
      </Sequence>
    </div>
  );
};
