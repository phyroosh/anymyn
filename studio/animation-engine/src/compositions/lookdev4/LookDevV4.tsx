import React from 'react';
import { Audio, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Shot1BullionOpeningV4 } from './Shot1BullionOpeningV4';
import { Shot2ReinvestmentPressV4 } from './Shot2ReinvestmentPressV4';
import { Shot3AccelerationTrackV4 } from './Shot3AccelerationTrackV4';
import { Shot4MonumentalPayoffV4 } from './Shot4MonumentalPayoffV4';

export const LookDevV4: React.FC = () => {
  const frame = useCurrentFrame();

  // Cross-dissolve transition opacities
  const shot1Opacity = interpolate(frame, [94, 100], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const shot2Opacity = interpolate(frame, [94, 100, 202, 208], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const shot3Opacity = interpolate(frame, [202, 208, 310, 316], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const shot4Opacity = interpolate(frame, [310, 316], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'relative',
        width: 1080,
        height: 1920,
        backgroundColor: '#070709',
        overflow: 'hidden',
      }}
    >
      {/* Shot 1: The Macro Bullion Opening (Frames 0 - 100) */}
      {frame <= 100 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: shot1Opacity,
          }}
        >
          <Sequence from={0} durationInFrames={100} name="Shot1_BullionOpening">
            <Shot1BullionOpeningV4 />
          </Sequence>
        </div>
      )}

      {/* Shot 2: The Re-investment Press (Frames 94 - 208) */}
      {frame >= 94 && frame <= 208 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: shot2Opacity,
          }}
        >
          <Sequence from={94} durationInFrames={114} name="Shot2_ReinvestmentPress">
            <Shot2ReinvestmentPressV4 />
          </Sequence>
        </div>
      )}

      {/* Shot 3: The 3D Trajectory Acceleration (Frames 202 - 316) */}
      {frame >= 202 && frame <= 316 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: shot3Opacity,
          }}
        >
          <Sequence from={202} durationInFrames={114} name="Shot3_AccelerationTrack">
            <Shot3AccelerationTrackV4 />
          </Sequence>
        </div>
      )}

      {/* Shot 4: The Monumental Payoff (Frames 310 - 420) */}
      {frame >= 310 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: shot4Opacity,
          }}
        >
          <Sequence from={310} durationInFrames={110} name="Shot4_MonumentalPayoff">
            <Shot4MonumentalPayoffV4 />
          </Sequence>
        </div>
      )}

      {/* Primary Documentary Narration */}
      <Audio
        src={staticFile('audio/narration_v3.mp3')}
        volume={1.45}
      />

      {/* Multi-Track Harmonic Score & Synchronized Tactile SFX */}
      <Audio
        src={staticFile('audio/soundtrack_v3.mp3')}
        volume={0.65}
      />
    </div>
  );
};
