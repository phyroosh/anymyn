import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene2Parity: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 85 },
  });

  // Animated growth bars (over frames 15 to 110)
  const barProgress = interpolate(frame, [15, 110], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Current values
  const simpleVal = Math.round(10000 + 10000 * barProgress); // 10k to 20k
  const compoundVal = Math.round(10000 * Math.pow(1.10, 10 * barProgress)); // 10k to 25,937

  const calloutSpring = spring({
    frame: frame - 80,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#06080B',
        color: '#F4F2EC',
        fontFamily: "Cantarell, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Background vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 40%, rgba(18, 25, 38, 0.65) 0%, rgba(4, 6, 9, 0.98) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Content Area */}
      <div
        style={{
          position: 'absolute',
          top: 240,
          left: 100,
          right: 100,
          opacity: enterSpring,
          transform: `translateY(${interpolate(enterSpring, [0, 1], [25, 0])}px)`,
        }}
      >
        {/* Chapter Masthead */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20,
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
            ANYMYN • CHAPTER II
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
            YEAR 0 → YEAR 10
          </span>
        </div>

        {/* Section Heading */}
        <h2
          style={{
            margin: '0 0 12px 0',
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: '#F4F2EC',
          }}
        >
          The Illusion of Parity
        </h2>

        <p
          style={{
            margin: '0 0 60px 0',
            fontSize: 26,
            color: '#9CA3AF',
            lineHeight: 1.4,
          }}
        >
          In the first decade, compounding looks virtually identical to linear progress.
        </p>

        {/* --- Comparative Visual Columns --- */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            alignItems: 'flex-end',
            height: 460,
            paddingBottom: 20,
            borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          {/* Simple Interest Column */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              justifyContent: 'flex-end',
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: '#A1A1AA',
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: 16,
              }}
            >
              ${simpleVal.toLocaleString()}
            </div>
            {/* Visual Bar */}
            <div
              style={{
                width: '100%',
                height: `${interpolate(simpleVal, [10000, 30000], [80, 260])}px`,
                backgroundColor: 'rgba(113, 113, 122, 0.35)',
                border: '1px solid #71717A',
                borderRadius: '8px 8px 0 0',
              }}
            />
            <div
              style={{
                marginTop: 18,
                fontSize: 18,
                fontWeight: 600,
                color: '#71717A',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              Simple Interest
            </div>
          </div>

          {/* Compound Growth Column */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              justifyContent: 'flex-end',
            }}
          >
            <div
              style={{
                fontSize: 42,
                fontWeight: 800,
                color: '#10B981',
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: 16,
              }}
            >
              ${compoundVal.toLocaleString()}
            </div>
            {/* Visual Bar */}
            <div
              style={{
                width: '100%',
                height: `${interpolate(compoundVal, [10000, 30000], [80, 337])}px`,
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                border: '1.5px solid #10B981',
                borderRadius: '8px 8px 0 0',
                boxShadow: '0 0 24px rgba(16, 185, 129, 0.15)',
              }}
            />
            <div
              style={{
                marginTop: 18,
                fontSize: 18,
                fontWeight: 700,
                color: '#34D399',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              Compound Growth
            </div>
          </div>
        </div>

        {/* --- The Psychological Trap Callout --- */}
        <div
          style={{
            marginTop: 48,
            padding: '24px 28px',
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderLeft: '3px solid #D4AF37',
            opacity: calloutSpring,
            transform: `translateY(${interpolate(calloutSpring, [0, 1], [15, 0])}px)`,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#FBBF24',
              fontFamily: 'JetBrains Mono, monospace',
              marginBottom: 8,
              letterSpacing: '0.06em',
            }}
          >
            YEAR 10 GAP: ONLY +$5,937
          </div>
          <div
            style={{
              fontSize: 22,
              lineHeight: 1.5,
              color: '#9CA3AF',
            }}
          >
            After 3,650 days of discipline, compounding is barely ahead.
            This deceptive lag is why most investors surrender prematurely.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
