import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Shot2ReinvestmentPressV4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const titleEntrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 85 },
  });

  // Cycle 1: Return leaves base, travels along 3D orbital trajectory, docks at frame 48
  const cycle1Progress = interpolate(frame, [8, 48], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cycle1Docked = frame >= 48;
  const cycle1Pulse = spring({
    frame: frame - 48,
    fps,
    config: { damping: 9, mass: 0.6, stiffness: 130 },
  });

  // Cycle 2: Return leaves enlarged base, docks at frame 90
  const cycle2Progress = interpolate(frame, [54, 90], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cycle2Docked = frame >= 90;
  const cycle2Pulse = spring({
    frame: frame - 90,
    fps,
    config: { damping: 9, mass: 0.6, stiffness: 130 },
  });

  // Physical dimension scaling of the base cylinder
  const baseScale =
    1.0 +
    (cycle1Docked ? 0.12 * Math.min(1, Math.max(0, cycle1Pulse)) : 0) +
    (cycle2Docked ? 0.13 * Math.min(1, Math.max(0, cycle2Pulse)) : 0);

  // Live foundation counter
  const currentBaseValue =
    frame < 48
      ? 10000
      : frame < 90
      ? Math.round(10000 + 1000 * Math.min(1, Math.max(0, cycle1Pulse)))
      : Math.round(11000 + 1100 * Math.min(1, Math.max(0, cycle2Pulse)));

  // Continuous rotation of calibration rings
  const ringRotation = frame * 1.6;

  // Cinematic slow camera push
  const cameraZoom = interpolate(frame, [0, 114], [0.98, 1.06], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#120F0D',
        backgroundImage: `
          radial-gradient(circle at 50% 48%, rgba(217, 119, 6, 0.24) 0%, rgba(18, 15, 13, 0.98) 72%),
          linear-gradient(180deg, #1C1713 0%, #0A0807 100%)
        `,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '160px 80px 140px 80px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Top Monumental Motion Headline (No corner metadata) */}
      <div
        style={{
          overflow: 'hidden',
          textAlign: 'center',
          maxWidth: 920,
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            fontSize: 78,
            fontWeight: 900,
            letterSpacing: '-0.035em',
            color: '#FAF5EC',
            margin: 0,
            lineHeight: 1.08,
            transform: `translateY(${interpolate(titleEntrance, [0, 1], [90, 0])}px)`,
            opacity: Math.max(0, titleEntrance),
          }}
        >
          YOUR RETURNS BECOME <br />
          <span style={{ color: '#10B981' }}>YOUR CAPITAL.</span>
        </h1>
      </div>

      {/* Centerpiece: The Dimensional Isometric Hydraulic Engine */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transform: `scale(${cameraZoom})`,
          transformOrigin: 'center center',
          height: 860,
        }}
      >
        <svg
          viewBox="0 0 860 820"
          style={{
            width: 860,
            height: 820,
            overflow: 'visible',
          }}
        >
          <defs>
            <radialGradient id="pressBaseGlowV4" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D97706" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#120F0D" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="returnArcGradV4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>

            <linearGradient id="pressCylinderBodyV4" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#44392B" />
              <stop offset="100%" stopColor="#1A1511" />
            </linearGradient>

            <linearGradient id="pressCylinderTopV4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FAF1DD" />
              <stop offset="50%" stopColor="#E2D0B2" />
              <stop offset="100%" stopColor="#A0875E" />
            </linearGradient>

            <filter id="pressGlowV4" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Floor Glow */}
          <ellipse cx="430" cy="460" rx={350 * baseScale} ry={145 * baseScale} fill="url(#pressBaseGlowV4)" />

          {/* Outer Calibration Ring */}
          <ellipse
            cx="430"
            cy="440"
            rx="370"
            ry="155"
            fill="none"
            stroke="rgba(214, 196, 162, 0.22)"
            strokeWidth="2"
            strokeDasharray="6 8"
          />

          {/* Guidance Track */}
          <ellipse
            cx="430"
            cy="440"
            rx="300"
            ry="125"
            fill="none"
            stroke="rgba(217, 119, 6, 0.35)"
            strokeWidth="1.5"
            strokeDasharray="4 12"
            transform={`rotate(${ringRotation * 0.5} 430 440)`}
          />

          {/* Isometric Capital Core Cylinder (Base Foundation) */}
          <g transform={`translate(430, 440) scale(${baseScale}) translate(-430, -440)`}>
            {/* Soft Ambient Contact Shadow */}
            <ellipse cx="430" cy="465" rx="215" ry="85" fill="rgba(0,0,0,0.7)" filter="blur(14px)" />

            {/* Cylinder Dimensional Walls */}
            <path
              d="M 215,410 C 215,490 645,490 645,410 L 645,460 C 645,540 215,540 215,460 Z"
              fill="url(#pressCylinderBodyV4)"
              stroke="#D6C4A2"
              strokeWidth="2.5"
            />

            {/* Cylinder Top Surface (Minted Face) */}
            <ellipse
              cx="430"
              cy="410"
              rx="215"
              ry="85"
              fill="url(#pressCylinderTopV4)"
              stroke="#FAF1DD"
              strokeWidth="3"
            />

            {/* Central Re-investment Well */}
            <ellipse
              cx="430"
              cy="410"
              rx="145"
              ry="58"
              fill="#181410"
              stroke="#B45309"
              strokeWidth="2.5"
            />
          </g>

          {/* Cycle 1: Return Energy Arc and Particle */}
          {frame >= 8 && (
            <g>
              <path
                id="pressPath1V4"
                d="M 640,410 C 800,340 750,165 430,165 C 240,165 280,310 425,395"
                fill="none"
                stroke="url(#returnArcGradV4)"
                strokeWidth={cycle1Docked ? 2.5 : 6}
                strokeDasharray="430"
                strokeDashoffset={interpolate(cycle1Progress, [0, 1], [430, 0])}
                opacity={cycle1Docked ? 0.45 : 0.95}
                filter="url(#pressGlowV4)"
              />

              {/* Kinetic Traveling Return Disc (Cycle 1: $1,000) */}
              {!cycle1Docked && (
                <g
                  transform={`translate(
                    ${interpolate(cycle1Progress, [0, 0.4, 0.8, 1], [640, 700, 320, 430])},
                    ${interpolate(cycle1Progress, [0, 0.4, 0.8, 1], [410, 205, 220, 405])}
                  )`}
                >
                  <circle cx="0" cy="0" r="22" fill="#10B981" filter="url(#pressGlowV4)" />
                  <circle cx="0" cy="0" r="11" fill="#FFFFFF" />
                  <rect
                    x="-95"
                    y="-56"
                    width="190"
                    height="42"
                    rx="8"
                    fill="#1A1511"
                    stroke="#10B981"
                    strokeWidth="2.5"
                  />
                  <text
                    x="0"
                    y="-28"
                    textAnchor="middle"
                    fill="#34D399"
                    fontSize="24"
                    fontWeight="900"
                    fontFamily="monospace"
                  >
                    +$1,000
                  </text>
                </g>
              )}

              {/* Docking Impact Pulse (Cycle 1) */}
              {cycle1Docked && frame < 68 && (
                <ellipse
                  cx="430"
                  cy="410"
                  rx={145 + cycle1Pulse * 95}
                  ry={58 + cycle1Pulse * 38}
                  fill="none"
                  stroke="#34D399"
                  strokeWidth={4.5 * (1 - cycle1Pulse)}
                  opacity={1 - cycle1Pulse}
                />
              )}
            </g>
          )}

          {/* Cycle 2: Accelerated Larger Return Loop */}
          {frame >= 54 && (
            <g>
              <path
                id="pressPath2V4"
                d="M 670,410 C 840,320 780,135 430,135 C 220,135 250,290 430,400"
                fill="none"
                stroke="url(#returnArcGradV4)"
                strokeWidth={cycle2Docked ? 3.5 : 8}
                strokeDasharray="480"
                strokeDashoffset={interpolate(cycle2Progress, [0, 1], [480, 0])}
                opacity={cycle2Docked ? 0.55 : 1.0}
                filter="url(#pressGlowV4)"
              />

              {!cycle2Docked && (
                <g
                  transform={`translate(
                    ${interpolate(cycle2Progress, [0, 0.4, 0.8, 1], [670, 730, 290, 430])},
                    ${interpolate(cycle2Progress, [0, 0.4, 0.8, 1], [410, 185, 195, 405])}
                  )`}
                >
                  <circle cx="0" cy="0" r="26" fill="#34D399" filter="url(#pressGlowV4)" />
                  <circle cx="0" cy="0" r="13" fill="#FFFFFF" />
                  <rect
                    x="-105"
                    y="-60"
                    width="210"
                    height="46"
                    rx="8"
                    fill="#1A1511"
                    stroke="#34D399"
                    strokeWidth="3"
                  />
                  <text
                    x="0"
                    y="-29"
                    textAnchor="middle"
                    fill="#34D399"
                    fontSize="26"
                    fontWeight="900"
                    fontFamily="monospace"
                  >
                    +$1,100
                  </text>
                </g>
              )}

              {cycle2Docked && (
                <ellipse
                  cx="430"
                  cy="410"
                  rx={165 + cycle2Pulse * 125}
                  ry={66 + cycle2Pulse * 50}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth={5.5 * (1 - cycle2Pulse)}
                  opacity={1 - cycle2Pulse}
                />
              )}
            </g>
          )}
        </svg>
      </div>

      {/* Pure Bold Numerical Foundation (No Card Container!) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: 40,
        }}
      >
        <span
          style={{
            fontSize: 22,
            letterSpacing: '0.24em',
            fontWeight: 800,
            color: '#A8A29E',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          COMPOUNDED FOUNDATION
        </span>
        <div
          style={{
            fontSize: 104,
            fontWeight: 900,
            letterSpacing: '-0.04em',
            color: '#FAF5EC',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
            textShadow: '0 0 32px rgba(217, 119, 6, 0.4)',
          }}
        >
          ${currentBaseValue.toLocaleString('en-US')}
        </div>
      </div>
    </div>
  );
};
