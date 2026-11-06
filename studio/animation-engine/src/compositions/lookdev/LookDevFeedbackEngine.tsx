import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const LookDevFeedbackEngine: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cycle 1: Return leaves base, travels along orbital path, docks back into core
  // Cycle 1 docking occurs at local frame 45
  const cycle1Progress = interpolate(frame, [8, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cycle1Docked = frame >= 45;
  const cycle1Pulse = spring({
    frame: frame - 45,
    fps,
    config: { damping: 10, mass: 0.6, stiffness: 120 },
  });

  // Cycle 2: Return leaves expanded base, docks at local frame 90
  const cycle2Progress = interpolate(frame, [52, 90], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cycle2Docked = frame >= 90;
  const cycle2Pulse = spring({
    frame: frame - 90,
    fps,
    config: { damping: 10, mass: 0.6, stiffness: 120 },
  });

  // Base physical dimensions scaling
  const baseScale =
    1.0 +
    (cycle1Docked ? 0.12 * Math.min(1, Math.max(0, cycle1Pulse)) : 0) +
    (cycle2Docked ? 0.13 * Math.min(1, Math.max(0, cycle2Pulse)) : 0);

  // Dynamic live base counter calculation
  const currentBaseValue =
    frame < 45
      ? 10000
      : frame < 90
      ? Math.round(10000 + 1000 * Math.min(1, Math.max(0, cycle1Pulse)))
      : Math.round(11000 + 1100 * Math.min(1, Math.max(0, cycle2Pulse)));

  // Rotation of orbital feedback loop
  const engineRotation = frame * 1.8;

  // Camera slow cinematic push
  const cameraZoom = interpolate(frame, [0, 115], [0.98, 1.05], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#141210',
        backgroundImage: `
          radial-gradient(circle at 50% 45%, rgba(180, 83, 9, 0.18) 0%, rgba(20, 18, 16, 0.96) 70%),
          linear-gradient(180deg, #1C1917 0%, #0C0A09 100%)
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
      {/* Editorial Header */}
      <div
        style={{
          borderBottom: '1px solid rgba(214, 199, 168, 0.2)',
          paddingBottom: 22,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <div>
          <span
            style={{
              fontSize: 18,
              letterSpacing: '0.24em',
              fontWeight: 800,
              color: '#D97706',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 8,
            }}
          >
            THE FEEDBACK MECHANISM
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
            Where Output Fuels Input
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: frame < 45 ? '#D97706' : '#10B981',
              fontFamily: 'monospace',
              letterSpacing: '0.05em',
            }}
          >
            {frame < 45 ? 'CYCLE 01 • 10% YIELD' : frame < 90 ? 'CYCLE 02 • RE-INVESTED' : 'CYCLE 03 • ACCELERATING'}
          </div>
        </div>
      </div>

      {/* Centerpiece: The Dimensional Isometric Kinetic Engine */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transform: `scale(${cameraZoom})`,
          transformOrigin: 'center center',
          height: 820,
        }}
      >
        {/* Isometric 3D SVG Turntable & Flow Loop */}
        <svg
          viewBox="0 0 860 820"
          style={{
            width: 860,
            height: 820,
            overflow: 'visible',
          }}
        >
          <defs>
            <radialGradient id="baseGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D97706" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#141210" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="returnGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>

            <linearGradient id="cylinderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3E3426" />
              <stop offset="100%" stopColor="#1A1512" />
            </linearGradient>

            <linearGradient id="cylinderTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FAF0DC" />
              <stop offset="50%" stopColor="#DFCDB0" />
              <stop offset="100%" stopColor="#9C835A" />
            </linearGradient>

            <filter id="glowFilter" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Isometric Base Glow */}
          <ellipse cx="430" cy="460" rx={340 * baseScale} ry={140 * baseScale} fill="url(#baseGlow)" />

          {/* Outer Orbital Guidance Tracks */}
          <ellipse
            cx="430"
            cy="440"
            rx="360"
            ry="150"
            fill="none"
            stroke="rgba(214, 196, 162, 0.22)"
            strokeWidth="2"
            strokeDasharray="6 8"
          />

          {/* Secondary Counter-Rotating Calibration Ring */}
          <ellipse
            cx="430"
            cy="440"
            rx="290"
            ry="120"
            fill="none"
            stroke="rgba(217, 119, 6, 0.35)"
            strokeWidth="1.5"
            strokeDasharray="4 12"
            transform={`rotate(${engineRotation * 0.5} 430 440)`}
          />

          {/* Isometric Capital Core Cylinder (Base) */}
          <g transform={`translate(430, 440) scale(${baseScale}) translate(-430, -440)`}>
            {/* Cylinder Bottom Shadow */}
            <ellipse cx="430" cy="460" rx="205" ry="80" fill="rgba(0,0,0,0.65)" filter="blur(12px)" />

            {/* Cylinder Body */}
            <path
              d="M 225,410 C 225,485 635,485 635,410 L 635,455 C 635,530 225,530 225,455 Z"
              fill="url(#cylinderGrad)"
              stroke="#D6C4A2"
              strokeWidth="2.5"
            />

            {/* Cylinder Top Surface (Isometric Coin Top) */}
            <ellipse
              cx="430"
              cy="410"
              rx="205"
              ry="80"
              fill="url(#cylinderTopGrad)"
              stroke="#FAF0DC"
              strokeWidth="3"
            />

            {/* Inner Recessed Core Well (where returns dock) */}
            <ellipse
              cx="430"
              cy="410"
              rx="140"
              ry="56"
              fill="#181512"
              stroke="#B45309"
              strokeWidth="2.5"
            />

            {/* Core Label */}
            <text
              x="430"
              y="405"
              textAnchor="middle"
              fill="#FAF5EC"
              fontSize="24"
              fontWeight="800"
              letterSpacing="2.5"
            >
              CAPITAL BASE
            </text>
            <text
              x="430"
              y="432"
              textAnchor="middle"
              fill="#D97706"
              fontSize="16"
              fontFamily="monospace"
              fontWeight="700"
            >
              [RE-INVESTMENT CORE]
            </text>
          </g>

          {/* Cycle 1: Return Energy Arc and Particle */}
          {frame >= 8 && (
            <g>
              <path
                id="feedbackPath1"
                d="M 625,410 C 780,340 730,170 430,170 C 250,170 290,310 425,395"
                fill="none"
                stroke="url(#returnGradient1)"
                strokeWidth={cycle1Docked ? 2.5 : 5}
                strokeDasharray="420"
                strokeDashoffset={interpolate(cycle1Progress, [0, 1], [420, 0])}
                opacity={cycle1Docked ? 0.45 : 0.95}
                filter="url(#glowFilter)"
              />

              {/* Kinetic Traveling Return Orb (Cycle 1: $1,000) */}
              {!cycle1Docked && (
                <g
                  transform={`translate(
                    ${interpolate(cycle1Progress, [0, 0.4, 0.8, 1], [625, 680, 330, 430])},
                    ${interpolate(cycle1Progress, [0, 0.4, 0.8, 1], [410, 210, 230, 405])}
                  )`}
                >
                  <circle cx="0" cy="0" r="16" fill="#10B981" filter="url(#glowFilter)" />
                  <circle cx="0" cy="0" r="8" fill="#FFFFFF" />
                  <rect
                    x="-75"
                    y="-48"
                    width="150"
                    height="32"
                    rx="6"
                    fill="#1C1917"
                    stroke="#10B981"
                    strokeWidth="2"
                  />
                  <text
                    x="0"
                    y="-27"
                    textAnchor="middle"
                    fill="#34D399"
                    fontSize="17"
                    fontWeight="800"
                    fontFamily="monospace"
                  >
                    +$1,000 YIELD
                  </text>
                </g>
              )}

              {/* Docking Impact Pulse (Cycle 1) */}
              {cycle1Docked && frame < 65 && (
                <ellipse
                  cx="430"
                  cy="410"
                  rx={140 + cycle1Pulse * 90}
                  ry={56 + cycle1Pulse * 36}
                  fill="none"
                  stroke="#34D399"
                  strokeWidth={4 * (1 - cycle1Pulse)}
                  opacity={1 - cycle1Pulse}
                />
              )}
            </g>
          )}

          {/* Cycle 2: Accelerated Larger Return Loop */}
          {frame >= 52 && (
            <g>
              <path
                id="feedbackPath2"
                d="M 660,410 C 820,320 760,140 430,140 C 230,140 260,290 430,400"
                fill="none"
                stroke="url(#returnGradient1)"
                strokeWidth={cycle2Docked ? 3.5 : 7}
                strokeDasharray="470"
                strokeDashoffset={interpolate(cycle2Progress, [0, 1], [470, 0])}
                opacity={cycle2Docked ? 0.55 : 1.0}
                filter="url(#glowFilter)"
              />

              {!cycle2Docked && (
                <g
                  transform={`translate(
                    ${interpolate(cycle2Progress, [0, 0.4, 0.8, 1], [660, 710, 300, 430])},
                    ${interpolate(cycle2Progress, [0, 0.4, 0.8, 1], [410, 190, 200, 405])}
                  )`}
                >
                  <circle cx="0" cy="0" r="20" fill="#34D399" filter="url(#glowFilter)" />
                  <circle cx="0" cy="0" r="10" fill="#FFFFFF" />
                  <rect
                    x="-85"
                    y="-52"
                    width="170"
                    height="36"
                    rx="6"
                    fill="#1C1917"
                    stroke="#34D399"
                    strokeWidth="2.5"
                  />
                  <text
                    x="0"
                    y="-28"
                    textAnchor="middle"
                    fill="#34D399"
                    fontSize="18"
                    fontWeight="800"
                    fontFamily="monospace"
                  >
                    +$1,100 YIELD
                  </text>
                </g>
              )}

              {cycle2Docked && (
                <ellipse
                  cx="430"
                  cy="410"
                  rx={160 + cycle2Pulse * 120}
                  ry={64 + cycle2Pulse * 48}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth={5 * (1 - cycle2Pulse)}
                  opacity={1 - cycle2Pulse}
                />
              )}
            </g>
          )}
        </svg>

        {/* Live Monolithic Foundation Counter Card */}
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            backgroundColor: 'rgba(28, 25, 23, 0.9)',
            border: '1.5px solid rgba(214, 196, 162, 0.4)',
            backdropFilter: 'blur(20px)',
            borderRadius: 14,
            padding: '22px 56px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
          }}
        >
          <span
            style={{
              fontSize: 16,
              letterSpacing: '0.22em',
              fontWeight: 700,
              color: '#A8A29E',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            ACTIVE CAPITAL FOUNDATION
          </span>
          <div
            style={{
              fontSize: 68,
              fontWeight: 900,
              letterSpacing: '-0.025em',
              color: '#FAF5EC',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            ${currentBaseValue.toLocaleString('en-US')}
          </div>
          <div
            style={{
              fontSize: 19,
              fontWeight: 600,
              color: frame < 45 ? '#D97706' : '#10B981',
              marginTop: 4,
            }}
          >
            {frame < 45
              ? 'Year 0: $10,000 base earning 10%'
              : frame < 90
              ? 'Year 1: $1,000 reinvested → Base is now $11,000'
              : 'Year 2: $1,100 reinvested → Base is now $12,100'}
          </div>
        </div>
      </div>

      {/* Bottom Editorial Axiom */}
      <div
        style={{
          borderTop: '1px solid rgba(120, 113, 108, 0.25)',
          paddingTop: 22,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <p
          style={{
            fontSize: 26,
            lineHeight: 1.4,
            color: '#E7E5E4',
            margin: 0,
            maxWidth: 800,
            fontWeight: 450,
          }}
        >
          Returns do not leave the system. <br />
          <span style={{ color: '#F59E0B', fontWeight: 700 }}>They become the foundation</span> that powers the next cycle.
        </p>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            border: '2px solid #D97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D97706',
            fontSize: 24,
            fontWeight: 800,
          }}
        >
          ↻
        </div>
      </div>
    </div>
  );
};
