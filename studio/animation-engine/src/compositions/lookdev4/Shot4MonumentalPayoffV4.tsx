import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Shot4MonumentalPayoffV4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring animations
  const simpleEntrance = spring({
    frame,
    fps,
    config: { damping: 13, mass: 0.9, stiffness: 80 },
  });

  const compoundEntrance = spring({
    frame: frame - 18,
    fps,
    config: { damping: 11, mass: 0.9, stiffness: 95 },
  });

  const multiplierEntrance = spring({
    frame: frame - 36,
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
          radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.18) 0%, rgba(7, 7, 9, 0.98) 75%),
          linear-gradient(180deg, #0C0C10 0%, #030304 100%)
        `,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '180px 80px 120px 80px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Centerpiece: Monumental Typographic Confrontation */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${cameraZoom})`,
          transformOrigin: 'center center',
          gap: 50,
          marginTop: 60,
        }}
      >
        {/* Metric Comparisons */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 40,
          }}
        >
          {/* Simple Interest Metric */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
              paddingBottom: 22,
              opacity: Math.max(0, simpleEntrance),
              transform: `translateY(${interpolate(simpleEntrance, [0, 1], [30, 0])}px)`,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  color: '#9CA3AF',
                  textTransform: 'uppercase',
                }}
              >
                SIMPLE INTEREST
              </span>
              <div
                style={{
                  fontSize: 64,
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
                  fontSize: 26,
                  fontWeight: 600,
                  color: '#9CA3AF',
                  fontFamily: 'monospace',
                }}
              >
                4.00×
              </span>
            </div>
          </div>

          {/* Compound Interest Monumental Metric */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderBottom: '2.5px solid rgba(16, 185, 129, 0.45)',
              paddingBottom: 26,
              opacity: Math.max(0, compoundEntrance),
              transform: `translateY(${interpolate(compoundEntrance, [0, 1], [35, 0])}px)`,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  letterSpacing: '0.2em',
                  color: '#34D399',
                  textTransform: 'uppercase',
                }}
              >
                COMPOUND CAPITAL
              </span>
              <div
                style={{
                  fontSize: 116,
                  fontWeight: 900,
                  color: '#FFFFFF',
                  marginTop: 6,
                  letterSpacing: '-0.04em',
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1,
                  textShadow: '0 0 40px rgba(16, 185, 129, 0.5)',
                }}
              >
                $174,494
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: '#34D399',
                  fontFamily: 'monospace',
                }}
              >
                17.45×
              </span>
            </div>
          </div>
        </div>

        {/* The Core Mathematical Verdict Lockup (Bold Typography, No Box) */}
        <div
          style={{
            width: '100%',
            opacity: Math.max(0, multiplierEntrance),
            transform: `translateY(${interpolate(multiplierEntrance, [0, 1], [30, 0])}px)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginTop: 20,
          }}
        >
          <div
            style={{
              fontSize: 128,
              fontWeight: 900,
              color: '#F59E0B',
              letterSpacing: '-0.04em',
              lineHeight: 1,
              textShadow: '0 0 48px rgba(245, 158, 11, 0.4)',
            }}
          >
            4.36×
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: '0.14em',
              color: '#FAF5EC',
              textTransform: 'uppercase',
              marginTop: 14,
            }}
          >
            The Simple-Interest Ending Balance
          </div>
        </div>
      </div>

      {/* Bottom Mandatory Model Disclaimer (Legible 26px!) */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          paddingTop: 24,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: 26,
            lineHeight: 1.45,
            color: '#9CA3AF',
            fontStyle: 'italic',
            margin: 0,
          }}
        >
          Hypothetical model: $10,000 principal at 10% annual return over 30 years. Annual compounding without taxes or fees.
        </p>
      </div>
    </div>
  );
};
