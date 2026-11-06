import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const LookDevOpening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Camera push-in and subtle tilt
  const cameraZoom = interpolate(frame, [0, 80], [0.96, 1.05], {
    extrapolateRight: 'clamp',
  });
  const cameraDriftY = interpolate(frame, [0, 80], [12, -8], {
    extrapolateRight: 'clamp',
  });

  // Entrance spring animations
  const titleEntrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 90 },
  });

  const medallionEntrance = spring({
    frame: frame - 8,
    fps,
    config: { damping: 12, mass: 1.0, stiffness: 80 },
  });

  const medallionFloat = Math.sin(frame * 0.05) * 6;
  const medallionRotate = interpolate(frame, [0, 80], [-2.5, 3.5], {
    extrapolateRight: 'clamp',
  });

  // Shimmer / light sweep across the physical core
  const shimmerPos = interpolate(frame, [15, 65], [-120, 220], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#F5F2EB',
        backgroundImage: `
          radial-gradient(circle at 50% 25%, rgba(255, 255, 255, 0.95) 0%, rgba(245, 242, 235, 0.5) 60%),
          linear-gradient(180deg, #FAF7F0 0%, #EAE4D6 100%)
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
      {/* Subtle architectural grid hairlines (warm ivory texture) */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.22,
          pointerEvents: 'none',
        }}
      >
        <line x1="80" y1="0" x2="80" y2="1920" stroke="#78716C" strokeWidth="1" strokeDasharray="4 8" />
        <line x1="1000" y1="0" x2="1000" y2="1920" stroke="#78716C" strokeWidth="1" strokeDasharray="4 8" />
        <line x1="0" y1="280" x2="1080" y2="280" stroke="#78716C" strokeWidth="1" strokeDasharray="4 8" />
        <line x1="0" y1="1640" x2="1080" y2="1640" stroke="#78716C" strokeWidth="1" strokeDasharray="4 8" />
      </svg>

      {/* Top Editorial Monograph Masthead (No chapter labels) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          opacity: interpolate(frame, [0, 20], [0, 1]),
          transform: `translateY(${interpolate(frame, [0, 20], [-10, 0])}px)`,
          borderBottom: '1px solid rgba(120, 113, 108, 0.25)',
          paddingBottom: 22,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#B45309',
            }}
          />
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: '#44403C',
            }}
          >
            ANYMYN MONOGRAPHS
          </span>
        </div>
        <span
          style={{
            fontSize: 18,
            fontFamily: 'monospace',
            color: '#78716C',
            letterSpacing: '0.12em',
          }}
        >
          VOL. IV • THE COMPOUND ENGINE
        </span>
      </div>

      {/* Centerpiece: Sculptural 3D Capital Core Medallion */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${cameraZoom}) translateY(${cameraDriftY}px)`,
          transformOrigin: 'center center',
          position: 'relative',
        }}
      >
        {/* Soft realistic cast shadow on ivory plane */}
        <div
          style={{
            position: 'absolute',
            width: 480,
            height: 100,
            borderRadius: '50%',
            backgroundColor: 'rgba(28, 25, 23, 0.18)',
            filter: 'blur(32px)',
            bottom: 30,
            transform: `scale(${interpolate(frame, [0, 80], [0.95, 1.05])})`,
          }}
        />

        {/* Sculptural Medallion Disk */}
        <div
          style={{
            width: 480,
            height: 480,
            borderRadius: '50%',
            position: 'relative',
            opacity: Math.max(0, medallionEntrance),
            transform: `translateY(${medallionFloat}px) rotate(${medallionRotate}deg)`,
            boxShadow: `
              0 36px 72px -16px rgba(28, 25, 23, 0.28),
              0 18px 36px -8px rgba(180, 83, 9, 0.2),
              inset 0 3px 6px rgba(255, 255, 255, 0.95),
              inset 0 -5px 10px rgba(68, 64, 60, 0.45)
            `,
            background: 'linear-gradient(145deg, #FFFDF8 0%, #E8DFC8 50%, #C4B28E 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '7px solid #D6C7A8',
            boxSizing: 'border-box',
          }}
        >
          {/* Concentric Guilloché Hairline Rings */}
          <div
            style={{
              position: 'absolute',
              inset: 18,
              borderRadius: '50%',
              border: '1.5px dashed rgba(180, 83, 9, 0.4)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 32,
              borderRadius: '50%',
              border: '1px solid rgba(120, 113, 108, 0.25)',
              pointerEvents: 'none',
            }}
          />

          {/* Light Sweep Reflection */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              overflow: 'hidden',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: 140,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
                transform: `translateX(${shimmerPos}%) rotate(25deg)`,
              }}
            />
          </div>

          {/* Medallion Engraved Typography */}
          <span
            style={{
              fontSize: 18,
              letterSpacing: '0.32em',
              fontWeight: 800,
              color: '#78716C',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            INITIAL PRINCIPAL
          </span>
          <span
            style={{
              fontSize: 76,
              fontWeight: 900,
              letterSpacing: '-0.035em',
              color: '#1C1917',
              textShadow: '0 2px 4px rgba(255, 255, 255, 0.8), 0 -1px 2px rgba(68, 64, 60, 0.3)',
            }}
          >
            $10,000
          </span>
          <span
            style={{
              fontSize: 21,
              fontWeight: 600,
              color: '#B45309',
              marginTop: 8,
              letterSpacing: '0.06em',
              fontFamily: 'serif',
              fontStyle: 'italic',
            }}
          >
            The Foundational Base
          </span>
        </div>

        {/* Tangible Spec Anchor Tag */}
        <div
          style={{
            marginTop: 46,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(120, 113, 108, 0.25)',
            padding: '12px 28px',
            borderRadius: 8,
            boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
            opacity: interpolate(frame, [25, 45], [0, 1]),
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: '#1C1917', letterSpacing: '0.05em' }}>
            CAGR: 10.0% ANNUAL
          </span>
          <div style={{ width: 1, height: 16, backgroundColor: '#A8A29E' }} />
          <span style={{ fontSize: 16, fontWeight: 600, color: '#78716C' }}>
            HORIZON: 30 YEARS
          </span>
        </div>
      </div>

      {/* Bottom Editorial Thesis Headline */}
      <div
        style={{
          opacity: Math.max(0, titleEntrance),
          transform: `translateY(${interpolate(frame, [0, 30], [25, 0])}px)`,
        }}
      >
        <h1
          style={{
            fontSize: 54,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
            color: '#1C1917',
            margin: 0,
            marginBottom: 16,
          }}
        >
          Compound capital <br />
          <span style={{ color: '#B45309', fontStyle: 'italic', fontFamily: 'serif', fontWeight: 600 }}>
            is not static.
          </span>
        </h1>
        <p
          style={{
            fontSize: 26,
            lineHeight: 1.45,
            color: '#57534E',
            margin: 0,
            maxWidth: 820,
            fontWeight: 450,
          }}
        >
          It is an autonomous engine where returns fold back into the base.
        </p>
      </div>
    </div>
  );
};
