import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Shot3AccelerationTrackV4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 85 },
  });

  // Curve draw progression across the shot (local frames 8 to 85)
  const drawProgress = interpolate(frame, [8, 85], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const currentYear = interpolate(drawProgress, [0, 1], [0, 30]);

  // Mathematical calculations along the runway
  const p = 10000;
  const r = 0.10;
  const currentSimple = p * (1 + r * currentYear);

  // SVG coordinate mapping for warm ivory architectural runway
  // ViewBox: 0 0 920 860
  // X: Year 0 (x=80) to Year 30 (x=840)
  // Y: $0 (y=740) to $180,000 (y=80)
  const mapX = (year: number) => 80 + (year / 30) * 760;
  const mapY = (val: number) => 740 - (val / 180000) * 660;

  // Build the SVG path string for Compound Curve up to currentYear
  const sampleSteps = 70;
  const curvePoints: string[] = [];
  const shadowPoints: string[] = [];
  for (let i = 0; i <= sampleSteps; i++) {
    const yr = (i / sampleSteps) * currentYear;
    const val = p * Math.pow(1 + r, yr);
    const x = mapX(yr).toFixed(1);
    const y = mapY(val).toFixed(1);
    curvePoints.push(`${x},${y}`);
    shadowPoints.push(`${x},${(mapY(val) + 10).toFixed(1)}`);
  }
  const compoundPath = curvePoints.length > 0 ? `M ${curvePoints.join(' L ')}` : '';
  const compoundShadowPath = shadowPoints.length > 0 ? `M ${shadowPoints.join(' L ')}` : '';

  // Simple interest endpoint
  const simpleEndX = mapX(currentYear);
  const simpleEndY = mapY(currentSimple);

  // Year 15 milestone reveal (at drawProgress >= 0.50, frame >= 46)
  const showYear15 = drawProgress >= 0.5;
  const year15Opacity = interpolate(frame, [46, 56], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Year 30 reveal (frame >= 82)
  const showYear30 = drawProgress >= 0.96;
  const year30Opacity = interpolate(frame, [80, 92], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Dynamic camera perspective drift
  const cameraZoom = interpolate(frame, [0, 114], [0.98, 1.05], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#F7F4EB',
        backgroundImage: `
          radial-gradient(circle at 55% 30%, rgba(255, 255, 255, 0.95) 0%, rgba(247, 244, 235, 0.6) 60%),
          linear-gradient(180deg, #FAF7F0 0%, #EAE3D4 100%)
        `,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '160px 80px 100px 80px',
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
            fontSize: 82,
            fontWeight: 900,
            letterSpacing: '-0.035em',
            color: '#1C1917',
            margin: 0,
            lineHeight: 1.05,
            transform: `translateY(${interpolate(entrance, [0, 1], [90, 0])}px)`,
            opacity: Math.max(0, entrance),
          }}
        >
          TIME IS <br />
          <span
            style={{
              color: '#B45309',
              fontStyle: 'italic',
              fontFamily: 'serif',
              fontWeight: 700,
            }}
          >
            THE EXPONENT.
          </span>
        </h1>
      </div>

      {/* Centerpiece: The Dimensional Architectural Growth Runway */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 980,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${cameraZoom})`,
          transformOrigin: 'center center',
        }}
      >
        <svg
          viewBox="0 0 920 860"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible',
          }}
        >
          <defs>
            <linearGradient id="warmIvoryCurveGradV4" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="65%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            <filter id="ribbonShadowV4" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.28 0"/>
            </filter>
          </defs>

          {/* Minimal Gridlines */}
          {[0, 50000, 100000, 150000, 180000].map((val) => {
            const y = mapY(val);
            return (
              <line
                key={val}
                x1="80"
                y1={y}
                x2="840"
                y2={y}
                stroke="rgba(120, 113, 108, 0.16)"
                strokeWidth="1.2"
              />
            );
          })}

          {/* Clean Year Vertical Markers */}
          {[0, 15, 30].map((yr) => {
            const x = mapX(yr);
            return (
              <g key={yr}>
                <line
                  x1={x}
                  y1="80"
                  x2={x}
                  y2="740"
                  stroke={yr === 15 ? 'rgba(180, 83, 9, 0.45)' : 'rgba(120, 113, 108, 0.18)'}
                  strokeWidth={yr === 15 ? 2 : 1}
                  strokeDasharray={yr === 15 ? '6 6' : 'none'}
                />
                <text
                  x={x}
                  y="780"
                  textAnchor="middle"
                  fill={yr === 15 ? '#B45309' : '#78716C'}
                  fontSize="24"
                  fontFamily="monospace"
                  fontWeight="700"
                >
                  YEAR {yr}
                </text>
              </g>
            );
          })}

          {/* Linear Simple Interest Line */}
          <line
            x1={mapX(0)}
            y1={mapY(p)}
            x2={simpleEndX}
            y2={simpleEndY}
            stroke="#78716C"
            strokeWidth="4"
            strokeDasharray="8 8"
          />
          {drawProgress > 0.15 && (
            <text
              x={simpleEndX > 680 ? simpleEndX - 16 : simpleEndX + 16}
              y={simpleEndX > 680 ? simpleEndY + 36 : simpleEndY + 6}
              textAnchor={simpleEndX > 680 ? 'end' : 'start'}
              fill="#57534E"
              fontSize="24"
              fontFamily="monospace"
              fontWeight="700"
            >
              Simple: ${Math.round(currentSimple).toLocaleString()}
            </text>
          )}

          {/* Drop shadow path of compound ribbon */}
          {compoundShadowPath && (
            <path
              d={compoundShadowPath}
              fill="none"
              stroke="rgba(28, 25, 23, 0.22)"
              strokeWidth="9"
              strokeLinecap="round"
              filter="url(#ribbonShadowV4)"
            />
          )}

          {/* Dimensional Compound Interest Braided Ribbon */}
          {compoundPath && (
            <path
              d={compoundPath}
              fill="none"
              stroke="url(#warmIvoryCurveGradV4)"
              strokeWidth="7"
              strokeLinecap="round"
            />
          )}

          {/* Dynamic Traveling Head Node */}
          {drawProgress > 0 && (
            <g transform={`translate(${mapX(currentYear)}, ${mapY(p * Math.pow(1 + r, currentYear))})`}>
              <circle cx="0" cy="0" r="16" fill="#10B981" opacity="0.35" />
              <circle cx="0" cy="0" r="8.5" fill="#047857" stroke="#FAF7F0" strokeWidth="3" />
            </g>
          )}

          {/* Year 15 Milestone Plaque (Big, Mobile-Readable!) */}
          {showYear15 && (
            <g opacity={year15Opacity} transform={`translate(${mapX(15)}, ${mapY(41772)})`}>
              <circle cx="0" cy="0" r="7" fill="#B45309" />
              <line x1="0" y1="0" x2="-28" y2="-72" stroke="#B45309" strokeWidth="2" />
              <rect
                x="-340"
                y="-165"
                width="320"
                height="92"
                rx="10"
                fill="#FFFDF8"
                stroke="#B45309"
                strokeWidth="2.5"
                filter="drop-shadow(0 12px 24px rgba(0,0,0,0.1))"
              />
              <text x="-320" y="-128" fill="#B45309" fontSize="22" fontWeight="800" letterSpacing="1">
                YEAR 15: $41,772
              </text>
              <text x="-320" y="-98" fill="#1C1917" fontSize="18" fontWeight="600">
                Growth ($31,772) &gt; Principal
              </text>
            </g>
          )}

          {/* Year 30 Climax Plaque (Big & Bold!) */}
          {showYear30 && (
            <g opacity={year30Opacity} transform={`translate(${mapX(30)}, ${mapY(174494)})`}>
              <circle cx="0" cy="0" r="9" fill="#D97706" />
              <rect
                x="-320"
                y="-60"
                width="300"
                height="86"
                rx="12"
                fill="#166534"
                stroke="#10B981"
                strokeWidth="2.8"
                filter="drop-shadow(0 16px 32px rgba(22, 101, 52, 0.4))"
              />
              <text x="-300" y="-30" fill="#86EFAC" fontSize="18" fontWeight="800" letterSpacing="1.5">
                YEAR 30 COMPOUND
              </text>
              <text x="-300" y="14" fill="#FFFFFF" fontSize="38" fontWeight="900" letterSpacing="-0.5">
                $174,494
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
