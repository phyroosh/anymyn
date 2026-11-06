import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle continuous optical push-in
  const cameraScale = interpolate(frame, [0, 145], [1.0, 1.05], {
    extrapolateRight: 'clamp',
  });

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  const numberSpring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 14, stiffness: 85 },
  });

  const timelineProgress = interpolate(frame, [45, 125], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#06080B',
        color: '#F4F2EC',
        fontFamily: "Cantarell, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        transform: `scale(${cameraScale})`,
        overflow: 'hidden',
      }}
    >
      {/* Cinematic Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 45%, rgba(16, 24, 38, 0.7) 0%, rgba(4, 6, 9, 0.98) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Atmospheric Horizon Sweep Line */}
      <div
        style={{
          position: 'absolute',
          top: '48%',
          left: 0,
          right: 0,
          height: 1,
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
        }}
      />

      {/* Content Container */}
      <div
        style={{
          position: 'absolute',
          top: 360,
          left: 100,
          right: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        {/* Chapter Masthead */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 32,
            opacity: titleSpring,
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: '#8E8C85',
              fontFamily: "Inter, -apple-system, sans-serif",
            }}
          >
            ANYMYN • CHAPTER I
          </span>
          <div
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: '#52525B',
            }}
          />
          <span
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: '#52525B',
              letterSpacing: '0.08em',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            THE HYPOTHESIS
          </span>
        </div>

        {/* Premise */}
        <div
          style={{
            fontSize: 34,
            fontWeight: 400,
            color: '#9CA3AF',
            letterSpacing: '-0.01em',
            marginBottom: 8,
            opacity: titleSpring,
            transform: `translateY(${interpolate(titleSpring, [0, 1], [20, 0])}px)`,
          }}
        >
          If you invest
        </div>

        {/* Hero Monumental Figure */}
        <div
          style={{
            fontSize: 124,
            fontWeight: 800,
            color: '#F4F2EC',
            letterSpacing: '-0.04em',
            lineHeight: 1.0,
            fontFamily: 'JetBrains Mono, monospace',
            opacity: numberSpring,
            transform: `translateY(${interpolate(numberSpring, [0, 1], [30, 0])}px)`,
            marginBottom: 20,
          }}
        >
          $10,000
        </div>

        {/* Conditions */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: '#10B981',
            letterSpacing: '-0.02em',
            marginBottom: 48,
            opacity: numberSpring,
          }}
        >
          at 10% annual return
        </div>

        {/* Visual Progress Horizon */}
        <div
          style={{
            width: '100%',
            opacity: interpolate(frame, [30, 60], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 16,
              color: '#71717A',
              fontFamily: 'JetBrains Mono, monospace',
              marginBottom: 12,
              letterSpacing: '0.06em',
            }}
          >
            <span>START: YEAR 0</span>
            <span style={{ color: '#D4AF37' }}>30-YEAR HORIZON</span>
            <span>END: YEAR 30</span>
          </div>
          <div
            style={{
              width: '100%',
              height: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${timelineProgress * 100}%`,
                height: '100%',
                backgroundColor: '#10B981',
              }}
            />
          </div>
        </div>

        {/* Editorial Subtext */}
        <div
          style={{
            marginTop: 70,
            fontSize: 22,
            lineHeight: 1.5,
            color: '#6B7280',
            maxWidth: 720,
            opacity: interpolate(frame, [50, 80], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          Most people assume wealth accumulates like wages—steady, predictable, and linear.
          The reality of compounding is far stranger.
        </div>
      </div>
    </AbsoluteFill>
  );
};
