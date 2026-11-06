import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene5Verdict: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  const cardsSpring = spring({
    frame: frame - 16,
    fps,
    config: { damping: 14, stiffness: 85 },
  });

  const takeawaySpring = spring({
    frame: frame - 45,
    fps,
    config: { damping: 14, stiffness: 75 },
  });

  // Fade out at the very end of the video
  const fadeOut = interpolate(frame, [170, 190], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#06080B',
        color: '#F4F2EC',
        fontFamily: "Cantarell, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        opacity: fadeOut,
        overflow: 'hidden',
      }}
    >
      {/* Background vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 45%, rgba(18, 25, 38, 0.75) 0%, rgba(4, 6, 9, 0.98) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Content Area */}
      <div
        style={{
          position: 'absolute',
          top: 220,
          left: 100,
          right: 100,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Masthead */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20,
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
            ANYMYN • CHAPTER V
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
            THE 30-YEAR VERDICT
          </span>
        </div>

        {/* Section Heading */}
        <h2
          style={{
            margin: '0 0 40px 0',
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            color: '#FFFFFF',
            opacity: titleSpring,
            transform: `translateY(${interpolate(titleSpring, [0, 1], [25, 0])}px)`,
          }}
        >
          Two Trajectories.<br />
          One Difference.
        </h2>

        {/* --- Monumental Editorial Comparison --- */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 32,
            opacity: cardsSpring,
            transform: `translateY(${interpolate(cardsSpring, [0, 1], [25, 0])}px)`,
          }}
        >
          {/* Simple Interest Result */}
          <div
            style={{
              padding: '28px 32px',
              borderRadius: 14,
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderLeft: '4px solid #71717A',
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#71717A',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: 8,
              }}
            >
              Simple Interest (Linear Return)
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 800,
                color: '#9CA3AF',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '-0.03em',
                lineHeight: 1.0,
              }}
            >
              $40,000
            </div>
            <div
              style={{
                fontSize: 20,
                color: '#6B7280',
                marginTop: 10,
              }}
            >
              +$1,000 per year • 4.00× starting principal
            </div>
          </div>

          {/* Compound Growth Result */}
          <div
            style={{
              padding: '32px 36px',
              borderRadius: 14,
              backgroundColor: 'rgba(16, 185, 129, 0.06)',
              borderLeft: '4px solid #10B981',
              boxShadow: '0 12px 36px rgba(16, 185, 129, 0.08)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#34D399',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                Compound Interest (Exponential Return)
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#FBBF24',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.06em',
                }}
              >
                4.36× LEVERAGE
              </span>
            </div>

            <div
              style={{
                fontSize: 88,
                fontWeight: 800,
                color: '#10B981',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '-0.04em',
                lineHeight: 1.0,
              }}
            >
              $174,494
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: '#F4F2EC',
                marginTop: 12,
              }}
            >
              <strong style={{ color: '#F59E0B' }}>+$134,494</strong> in compound surplus • 17.45× capital
            </div>
          </div>
        </div>

        {/* --- Monumental Thesis Statement --- */}
        <div
          style={{
            marginTop: 56,
            paddingTop: 36,
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            opacity: takeawaySpring,
            transform: `translateY(${interpolate(takeawaySpring, [0, 1], [15, 0])}px)`,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: '#F59E0B',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontFamily: 'JetBrains Mono, monospace',
              marginBottom: 10,
            }}
          >
            THE LAW OF CAPITAL
          </div>

          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            Time wasn't just a factor.<br />
            <span
              style={{
                background: 'linear-gradient(90deg, #10B981 0%, #F59E0B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              It was the exponent.
            </span>
          </div>

          {/* Footnote */}
          <div
            style={{
              marginTop: 36,
              fontSize: 16,
              color: '#6B7280',
              fontFamily: "Inter, -apple-system, sans-serif",
              lineHeight: 1.45,
            }}
          >
            Simplified educational model: $10,000 @ 10% annual compounding. All proceeds reinvested. Excludes fees, taxes, and inflation.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
