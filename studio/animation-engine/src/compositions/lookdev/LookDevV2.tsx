import React from 'react';
import { Audio, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { LookDevOpening } from './LookDevOpening';
import { LookDevFeedbackEngine } from './LookDevFeedbackEngine';
import { LookDevFinancialTransition } from './LookDevFinancialTransition';

export const LookDevV2: React.FC = () => {
  const frame = useCurrentFrame();

  // Cross-dissolve transitions
  // Transition 1: Opening -> Feedback Engine (around frame 78-84)
  const openingOpacity = interpolate(frame, [76, 84], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const feedbackEngineOpacity = interpolate(
    frame,
    [76, 84, 180, 188],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const transitionOpacity = interpolate(frame, [180, 188], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'relative',
        width: 1080,
        height: 1920,
        backgroundColor: '#07120B',
        overflow: 'hidden',
      }}
    >
      {/* Beat 1: Cinematic Opening (Frames 0 - 84) */}
      {frame <= 84 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: openingOpacity,
          }}
        >
          <Sequence from={0} durationInFrames={85} name="Beat1_CinematicOpening">
            <LookDevOpening />
          </Sequence>
        </div>
      )}

      {/* Beat 2: The Feedback Loop Engine (Frames 76 - 188) */}
      {frame >= 76 && frame <= 188 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: feedbackEngineOpacity,
          }}
        >
          <Sequence from={76} durationInFrames={113} name="Beat2_FeedbackEngine">
            <LookDevFeedbackEngine />
          </Sequence>
        </div>
      )}

      {/* Beat 3: Seamless Unfurling into 30-Year Reality (Frames 180 - 285) */}
      {frame >= 180 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: transitionOpacity,
          }}
        >
          <Sequence from={180} durationInFrames={105} name="Beat3_FinancialTransition">
            <LookDevFinancialTransition />
          </Sequence>
        </div>
      )}

      {/* Primary Voiceover Track */}
      <Audio
        src={staticFile('audio/narration_lookdev.mp3')}
        volume={1.35}
      />

      {/* Harmonic Tactile Ambient Bed */}
      <Audio
        src={staticFile('audio/ambient_lookdev.mp3')}
        volume={0.35}
      />
    </div>
  );
};
