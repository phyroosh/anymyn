import React from 'react';
import { Audio, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Scene1TheIllusion } from './Scene1TheIllusion';
import { Scene2DifferentWorld } from './Scene2DifferentWorld';
import { Scene3UnderstandingInflation } from './Scene3UnderstandingInflation';
import { Scene4NumericalReveal } from './Scene4NumericalReveal';
import { Scene5VisualPayoff } from './Scene5VisualPayoff';
import { Scene6Conclusion } from './Scene6Conclusion';

export const TheInvisibleCostMaster: React.FC = () => {
  const frame = useCurrentFrame();

  // Subtle cross-dissolve opacities at scene transitions
  // S1 (0-315) -> S2 (315-720)
  const s1Opacity = interpolate(frame, [308, 315], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const s2Opacity = interpolate(frame, [315, 322, 713, 720], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // S2 -> S3 (720-1035)
  const s3Opacity = interpolate(frame, [720, 727, 1028, 1035], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // S3 -> S4 (1035-1440)
  const s4Opacity = interpolate(frame, [1035, 1042, 1433, 1440], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // S4 -> S5 (1440-1800)
  const s5Opacity = interpolate(frame, [1440, 1447, 1793, 1800], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // S5 -> S6 (1800-2070)
  const s6Opacity = interpolate(frame, [1800, 1807], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'relative',
        width: 1080,
        height: 1920,
        backgroundColor: '#060608',
        overflow: 'hidden',
      }}
    >
      {/* Scene 1: The Illusion (Frames 0 – 315 / 0.0s – 10.5s) */}
      {frame <= 315 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s1Opacity }}>
          <Sequence from={0} durationInFrames={315} name="Scene1_TheIllusion">
            <Scene1TheIllusion />
          </Sequence>
        </div>
      )}

      {/* Scene 2: Same Money, Different World (Frames 315 – 720 / 10.5s – 24.0s) */}
      {frame >= 310 && frame <= 720 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s2Opacity }}>
          <Sequence from={315} durationInFrames={405} name="Scene2_DifferentWorld">
            <Scene2DifferentWorld />
          </Sequence>
        </div>
      )}

      {/* Scene 3: Understanding Inflation (Frames 720 – 1035 / 24.0s – 34.5s) */}
      {frame >= 715 && frame <= 1035 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s3Opacity }}>
          <Sequence from={720} durationInFrames={315} name="Scene3_UnderstandingInflation">
            <Scene3UnderstandingInflation />
          </Sequence>
        </div>
      )}

      {/* Scene 4: The Numerical Reveal (Frames 1035 – 1440 / 34.5s – 48.0s) */}
      {frame >= 1030 && frame <= 1440 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s4Opacity }}>
          <Sequence from={1035} durationInFrames={405} name="Scene4_NumericalReveal">
            <Scene4NumericalReveal />
          </Sequence>
        </div>
      )}

      {/* Scene 5: The Visual Payoff (Frames 1440 – 1800 / 48.0s – 60.0s) */}
      {frame >= 1435 && frame <= 1800 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s5Opacity }}>
          <Sequence from={1440} durationInFrames={360} name="Scene5_VisualPayoff">
            <Scene5VisualPayoff />
          </Sequence>
        </div>
      )}

      {/* Scene 6: The Conclusion (Frames 1800 – 2070 / 60.0s – 69.0s) */}
      {frame >= 1795 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s6Opacity }}>
          <Sequence from={1800} durationInFrames={270} name="Scene6_Conclusion">
            <Scene6Conclusion />
          </Sequence>
        </div>
      )}

      {/* Master Broadcast Normalized Audio (Voiceover + Procedural Score + SFX Hits @ -17.3 LUFS) */}
      <Audio
        src={staticFile('audio/the-invisible-cost/master_audio.mp3')}
        volume={1.0}
      />
    </div>
  );
};
