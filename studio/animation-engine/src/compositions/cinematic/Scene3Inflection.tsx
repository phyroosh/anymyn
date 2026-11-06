import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene3Inflection: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 75 },
  });

  const glowIntensity = interpolate(frame, [15, 60], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const numberSpring = spring({
    frame: frame - 25,
    fps,
    config: { damping: 14, stiffness: 85 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#05070A',
        color: '#F4F2EC',
        fontFamily: "Cantarell, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Radiant Cinematic Core Glow */}
      <div
        style={{
          position: 'absolute',
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(16, 185, 129, 0.05) 50%, transparent 75%)',
          opacity: glowIntensity,
          pointerEvents: 'none',
        }}
      />

      {/* Radiant Horizon Break Line */}
      <div
        style={{
          position: 'absolute',
          top: 680,
          left: 100,
          right: 100,
          height: 2,
          background: 'linear-gradient(90deg, transparent 0%, #F59E0B 50%, transparent 100%)',
          opacity: glowIntensity,
          boxShadow: '0 0 20px #F59E0B',
        }}
      />

      {/* Main Content Area */}
      <div
        style={{
          position: 'absolute',
          top: 360,
          left: 100,
          right: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Chapter Masthead */}
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: '#F59E0B',
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: 24,
            opacity: titleSpring,
          }}
        >
          CHAPTER III • YEAR 15
        </div>

        {/* Hero Title */}
        <h2
          style={{
            margin: 0,
            fontSize: 76,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            color: '#FFFFFF',
            opacity: titleSpring,
            transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
          }}
        >
          THE INFLECTION<br />
          <span style={{ color: '#F59E0B' }}>HORIZON</span>
        </h2>

        {/* Milestone Balance */}
        <div
          style={{
            marginTop: 64,
            fontSize: 104,
            fontWeight: 800,
            color: '#10B981',
            letterSpacing: '-0.04em',
            fontFamily: 'JetBrains Mono, monospace',
            lineHeight: 1.0,
            opacity: numberSpring,
            transform: `scale(${interpolate(numberSpring, [0, 1], [0.92, 1.0])})`,
          }}
        >
          $41,772
        </div>

        <div
          style={{
            marginTop: 14,
            fontSize: 22,
            fontWeight: 600,
            color: '#9CA3AF',
            fontFamily: 'JetBrains Mono, monospace',
            opacity: numberSpring,
          }}
        >
          VS $25,000 SIMPLE INTEREST
        </div>

        {/* The Fundamental Shift Thesis */}
        <div
          style={{
            marginTop: 60,
            maxWidth: 720,
            fontSize: 26,
            lineHeight: 1.5,
            color: '#CBD5E1',
            opacity: interpolate(frame, [35, 65], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          At Year 15, the annual return alone surpasses your entire starting capital.
          <br /><br />
          <strong style={{ color: '#F4F2EC' }}>Your money is now generating more wealth than your original savings ever could.</strong>
        </div>
      </div>
    </AbsoluteFill>
  );
};
