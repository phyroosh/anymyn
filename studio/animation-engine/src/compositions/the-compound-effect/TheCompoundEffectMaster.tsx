import React from 'react';
import { Audio, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Scene1MuseumOpening } from './Scene1MuseumOpening';
import { Scene2TactileFoundation } from './Scene2TactileFoundation';
import { Scene3FeedbackEngine } from './Scene3FeedbackEngine';
import { Scene4TimeObservatory } from './Scene4TimeObservatory';
import { Scene5TheDivergence } from './Scene5TheDivergence';
import { Scene6MonumentalVerdict } from './Scene6MonumentalVerdict';

export const TheCompoundEffectMaster: React.FC = () => {
  const frame = useCurrentFrame();

  // Subtle cross-dissolves at scene transitions
  // S1 (0-255) -> S2 (255-585)
  const s1Opacity = interpolate(frame, [248, 255], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const s2Opacity = interpolate(frame, [255, 262, 578, 585], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // S2 -> S3 (585-1005)
  const s3Opacity = interpolate(frame, [585, 592, 998, 1005], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // S3 -> S4 (1005-1425)
  const s4Opacity = interpolate(frame, [1005, 1012, 1418, 1425], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // S4 -> S5 (1425-1875)
  const s5Opacity = interpolate(frame, [1425, 1432, 1868, 1875], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // S5 -> S6 (1875-2280)
  const s6Opacity = interpolate(frame, [1875, 1882], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

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
      {/* Scene 1: The Museum Opening (Frames 0 – 255 / 0.0s – 8.5s) */}
      {frame <= 255 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s1Opacity }}>
          <Sequence from={0} durationInFrames={255} name="Scene1_MuseumOpening">
            <Scene1MuseumOpening />
          </Sequence>
        </div>
      )}

      {/* Scene 2: The Tactile Foundation (Frames 255 – 585 / 8.5s – 19.5s) */}
      {frame >= 250 && frame <= 585 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s2Opacity }}>
          <Sequence from={255} durationInFrames={330} name="Scene2_TactileFoundation">
            <Scene2TactileFoundation />
          </Sequence>
        </div>
      )}

      {/* Scene 3: The Feedback Engine (Frames 585 – 1005 / 19.5s – 33.5s) */}
      {frame >= 580 && frame <= 1005 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s3Opacity }}>
          <Sequence from={585} durationInFrames={420} name="Scene3_FeedbackEngine">
            <Scene3FeedbackEngine />
          </Sequence>
        </div>
      )}

      {/* Scene 4: The Time Observatory (Frames 1005 – 1425 / 33.5s – 47.5s) */}
      {frame >= 1000 && frame <= 1425 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s4Opacity }}>
          <Sequence from={1005} durationInFrames={420} name="Scene4_TimeObservatory">
            <Scene4TimeObservatory />
          </Sequence>
        </div>
      )}

      {/* Scene 5: The Divergence (Frames 1425 – 1875 / 47.5s – 62.5s) */}
      {frame >= 1420 && frame <= 1875 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s5Opacity }}>
          <Sequence from={1425} durationInFrames={450} name="Scene5_TheDivergence">
            <Scene5TheDivergence />
          </Sequence>
        </div>
      )}

      {/* Scene 6: The Monumental Verdict (Frames 1875 – 2280 / 62.5s – 76.0s) */}
      {frame >= 1870 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s6Opacity }}>
          <Sequence from={1875} durationInFrames={405} name="Scene6_MonumentalVerdict">
            <Scene6MonumentalVerdict />
          </Sequence>
        </div>
      )}

      {/* Master Broadcast Normalized Audio (Voiceover + Procedural Score + SFX Hits @ -16.5 LUFS) */}
      <Audio
        src={staticFile('audio/the-compound-effect/master_audio.mp3')}
        volume={1.0}
      />
    </div>
  );
};
