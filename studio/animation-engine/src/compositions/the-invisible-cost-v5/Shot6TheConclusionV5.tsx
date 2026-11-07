import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from './theme';
import { MonetaryMedallionProp } from './components/MonetaryMedallionProp';

export const Shot6TheConclusionV5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for the overall shot
  const entrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 85 },
  });

  // Phase 1: frames 0 to 135 (0s - 4.5s) — "THE NUMBER STAYED THE SAME."
  // Phase 2: frames 135 to 300 (4.5s - 10s) — "WHAT IT CAN BUY CHANGED."
  const phase1Opacity = interpolate(frame, [0, 20, 120, 140], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const phase2Entrance = spring({
    frame: Math.max(0, frame - 135),
    fps,
    config: { damping: 18, stiffness: 85 },
  });

  const phase2Opacity = interpolate(frame, [135, 150], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scene exit fade to ivory background (frames 285 to 300)
  const sceneOpacity = interpolate(frame, [285, 300], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Medallion subtle scale and floating dynamics
  const medallionScale = interpolate(entrance, [0, 1], [0.85, 1.05]);
  const subtleFloat = Math.sin(frame * 0.05) * 6;

  return (
    <div
      style={{
        width: THEME.layout.width,
        height: THEME.layout.height,
        position: 'relative',
        overflow: 'hidden',
        opacity: sceneOpacity,
        fontFamily: THEME.typography.fontSerif,
      }}
    >
      {/* Dynamic Headline Area — Progressive Disclosure */}
      <div
        style={{
          position: 'absolute',
          top: THEME.layout.safeArea.top + 30,
          left: THEME.layout.safeArea.left,
          right: THEME.layout.safeArea.right,
          textAlign: 'center',
          zIndex: 30,
        }}
      >
        {/* Phase 1 Statement */}
        <div
          style={{
            ...THEME.typography.statement,
            color: THEME.colors.textPrimary,
            opacity: phase1Opacity,
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            textTransform: 'uppercase',
          }}
        >
          The Number
          <br />
          Stayed The Same.
        </div>

        {/* Phase 2 Statement */}
        <div
          style={{
            ...THEME.typography.statement,
            color: THEME.colors.textPrimary,
            opacity: phase2Opacity,
            transform: `translateY(${(1 - phase2Entrance) * 20}px)`,
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            textTransform: 'uppercase',
          }}
        >
          What It Can Buy
          <br />
          <span style={{ color: THEME.colors.accentAmber }}>Changed.</span>
        </div>
      </div>

      {/* Central Visual Focus: The Sculptural Monetary Seal Medallion */}
      <div
        style={{
          position: 'absolute',
          top: 610 + subtleFloat,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${medallionScale})`,
          zIndex: 20,
        }}
      >
        <MonetaryMedallionProp scale={1.15} opacity={entrance} />

        {/* Supporting Punchline / Core Takeaway */}
        <div
          style={{
            marginTop: 48,
            opacity: phase2Opacity,
            transform: `translateY(${(1 - phase2Entrance) * 15}px)`,
            textAlign: 'center',
            maxWidth: 820,
          }}
        >
          <div
            style={{
              fontSize: 34,
              fontWeight: 800,
              fontFamily: THEME.typography.fontSans,
              letterSpacing: 2,
              color: THEME.colors.textPrimary,
              textTransform: 'uppercase',
            }}
          >
            Never Mistake The Number
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 800,
              fontFamily: THEME.typography.fontSans,
              letterSpacing: 2,
              color: THEME.colors.accentAmber,
              textTransform: 'uppercase',
              marginTop: 6,
            }}
          >
            For The Purchasing Power.
          </div>
        </div>
      </div>

      {/* Compliant Mobile Legal & Educational Disclaimer */}
      <div
        style={{
          position: 'absolute',
          bottom: THEME.layout.safeArea.bottom,
          left: THEME.layout.safeArea.left,
          right: THEME.layout.safeArea.right,
          textAlign: 'center',
          zIndex: 30,
          opacity: interpolate(frame, [30, 60], [0, 0.85], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 500,
            fontFamily: THEME.typography.fontSans,
            color: THEME.colors.textMuted,
            lineHeight: 1.4,
            letterSpacing: 0.3,
            maxWidth: 880,
            margin: '0 auto',
          }}
        >
          Hypothetical illustration: $100 with 3% annual compound inflation over 20 years.
          Individual prices and actual inflation rates vary. Educational analysis only, not financial advice.
        </div>
      </div>
    </div>
  );
};
