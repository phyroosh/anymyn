import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Shot4MonumentalPayoff: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring animations
  const headerEntrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 85 },
  });

  const simpleEntrance = spring({
    frame: frame - 10,
    fps,
    config: { damping: 13, mass: 0.9, stiffness: 80 },
  });

  const compoundEntrance = spring({
    frame: frame - 22,
    fps,
    config: { damping: 11, mass: 0.9, stiffness: 95 },
  });

  const multiplierEntrance = spring({
    frame: frame - 38,
    fps,
    config: { damping: 12, mass: 0.8, stiffness: 90 },
  });

  // Slow optical camera push
  const cameraZoom = interpolate(frame, [0, 110], [0.97, 1.04], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#070709',
        backgroundImage: `
          radial-gradient(circle at 50% 48%, rgba(16, 185, 129, 0.16) 0%, rgba(7, 7, 9, 0.98) 72%),
          linear-gradient(180deg, #0C0C10 0%, #030304 100%)
        `,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '240px 80px 180px 80px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Top Editorial Monograph Masthead */}
      <div
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.14)',
          paddingBottom: 22,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          opacity: Math.max(0, headerEntrance),
        }}
      >
        <div>
          <span
            style={{
              fontSize: 18,
              letterSpacing: '0.24em',
              fontWeight: 800,
              color: '#34D399',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 8,
            }}
          >
            THE 30-YEAR VERDICT
          </span>
          <h2
            style={{
              fontSize: 44,
              fontWeight: 800,
              color: '#FAF5EC',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            The Divergence Payoff
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#F59E0B',
              fontFamily: 'monospace',
              letterSpacing: '0.05em',
            }}
          >
            YEAR 30 FINAL
          </div>
        </div>
      </div>

      {/* Centerpiece: Monumental Typographic Confrontation (No Cards!) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${cameraZoom})`,
          transformOrigin: 'center center',
          gap: 40,
        }}
      >
        {/* Simple vs Compound Monumental Rows */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 36,
          }}
        >
          {/* Simple Interest Metric */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              paddingBottom: 20,
              opacity: Math.max(0, simpleEntrance),
              transform: `translateY(${interpolate(simpleEntrance, [0, 1], [30, 0])}px)`,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  color: '#9CA3AF',
                  textTransform: 'uppercase',
                }}
              >
                SIMPLE INTEREST (LINEAR)
              </span>
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 800,
                  color: '#D1D5DB',
                  marginTop: 6,
                  letterSpacing: '-0.02em',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                $40,000
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: '#9CA3AF',
                  fontFamily: 'monospace',
                }}
              >
                4.00× PRINCIPAL
              </span>
            </div>
          </div>

          {/* Compound Interest Monumental Metric */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderBottom: '2px solid rgba(16, 185, 129, 0.4)',
              paddingBottom: 24,
              opacity: Math.max(0, compoundEntrance),
              transform: `translateY(${interpolate(compoundEntrance, [0, 1], [35, 0])}px)`,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: '0.22em',
                  color: '#34D399',
                  textTransform: 'uppercase',
                }}
              >
                COMPOUND CAPITAL (EXPONENTIAL)
              </span>
              <div
                style={{
                  fontSize: 92,
                  fontWeight: 900,
                  color: '#FFFFFF',
                  marginTop: 6,
                  letterSpacing: '-0.04em',
                  fontVariantNumeric: 'tabular-nums',
                  textShadow: '0 0 32px rgba(16, 185, 129, 0.45)',
                }}
              >
                $174,494
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#34D399',
                  fontFamily: 'monospace',
                }}
              >
                17.45× CAPITAL
              </span>
            </div>
          </div>
        </div>

        {/* The Core Mathematical Verdict Lockup */}
        <div
          style={{
            width: '100%',
            opacity: Math.max(0, multiplierEntrance),
            transform: `translateY(${interpolate(multiplierEntrance, [0, 1], [25, 0])}px)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1.5px solid rgba(16, 185, 129, 0.45)',
            borderRadius: 14,
            padding: '24px 36px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              fontSize: 68,
              fontWeight: 900,
              color: '#F59E0B',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            4.36×
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: '0.16em',
              color: '#FAF5EC',
              textTransform: 'uppercase',
              marginTop: 10,
              textAlign: 'center',
            }}
          >
            The Simple-Interest Ending Balance
          </div>
        </div>
      </div>

      {/* Bottom Mandatory Model Disclaimer */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.14)',
          paddingTop: 20,
        }}
      >
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.45,
            color: '#6B7280',
            fontStyle: 'italic',
            margin: 0,
          }}
        >
          Hypothetical model: $10,000 initial principal, 10% annual return, 30-year horizon, annual compounding.
          Does not account for fees or taxes. Past performance does not guarantee future results.
        </p>
      </div>
    </div>
  );
};
