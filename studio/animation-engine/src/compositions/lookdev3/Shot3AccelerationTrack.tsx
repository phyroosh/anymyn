import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Shot3AccelerationTrack: React.FC = () => {
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
  const currentCompound = p * Math.pow(1 + r, currentYear);

  // SVG coordinate mapping for warm ivory architectural runway
  // ViewBox: 0 0 920 720
  // X: Year 0 (x=80) to Year 30 (x=840)
  // Y: $0 (y=640) to $180,000 (y=70)
  const mapX = (year: number) => 80 + (year / 30) * 760;
  const mapY = (val: number) => 640 - (val / 180000) * 570;

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
    shadowPoints.push(`${x},${(mapY(val) + 8).toFixed(1)}`);
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
          radial-gradient(circle at 60% 30%, rgba(255, 255, 255, 0.95) 0%, rgba(247, 244, 235, 0.6) 60%),
          linear-gradient(180deg, #FAF7F0 0%, #EAE3D4 100%)
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
      {/* Top Editorial Monograph Header */}
      <div
        style={{
          borderBottom: '1px solid rgba(120, 113, 108, 0.25)',
          paddingBottom: 22,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          opacity: Math.max(0, entrance),
        }}
      >
        <div>
          <span
            style={{
              fontSize: 18,
              letterSpacing: '0.24em',
              fontWeight: 800,
              color: '#B45309',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 8,
            }}
          >
            THE 30-YEAR RUNWAY
          </span>
          <h2
            style={{
              fontSize: 44,
              fontWeight: 800,
              color: '#1C1917',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Exponential Acceleration
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 16, color: '#78716C', fontFamily: 'monospace' }}>
            ELAPSED HORIZON
          </span>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#B45309',
              fontFamily: 'monospace',
              marginTop: 4,
            }}
          >
            YEAR {Math.floor(currentYear)} / 30
          </div>
        </div>
      </div>

      {/* Centerpiece: The Dimensional Architectural Growth Runway */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 720,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${cameraZoom})`,
          transformOrigin: 'center center',
        }}
      >
        <svg
          viewBox="0 0 920 720"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible',
          }}
        >
          <defs>
            <linearGradient id="warmIvoryCurveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="65%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            <filter id="ribbonShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.25 0"/>
            </filter>
          </defs>

          {/* Gridlines */}
          {[0, 50000, 100000, 150000, 180000].map((val) => {
            const y = mapY(val);
            return (
              <g key={val}>
                <line
                  x1="80"
                  y1={y}
                  x2="840"
                  y2={y}
                  stroke="rgba(120, 113, 108, 0.16)"
                  strokeWidth="1"
                />
                <text
                  x="70"
                  y={y + 5}
                  textAnchor="end"
                  fill="#78716C"
                  fontSize="15"
                  fontFamily="monospace"
                >
                  ${val >= 1000 ? `${val / 1000}k` : val}
                </text>
              </g>
            );
          })}

          {/* Year Vertical Hairlines */}
          {[0, 10, 15, 20, 30].map((yr) => {
            const x = mapX(yr);
            return (
              <g key={yr}>
                <line
                  x1={x}
                  y1="70"
                  x2={x}
                  y2="640"
                  stroke={yr === 15 ? 'rgba(180, 83, 9, 0.45)' : 'rgba(120, 113, 108, 0.14)'}
                  strokeWidth={yr === 15 ? 1.5 : 1}
                  strokeDasharray={yr === 15 ? '4 4' : 'none'}
                />
                <text
                  x={x}
                  y="665"
                  textAnchor="middle"
                  fill={yr === 15 ? '#B45309' : '#78716C'}
                  fontSize="15"
                  fontFamily="monospace"
                  fontWeight={yr === 15 ? '700' : '500'}
                >
                  YR {yr}
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
            strokeWidth="3.2"
            strokeDasharray="6 6"
          />
          {drawProgress > 0.12 && (
            <text
              x={simpleEndX + 12}
              y={simpleEndY + 5}
              fill="#57534E"
              fontSize="16"
              fontFamily="monospace"
              fontWeight="600"
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
              strokeWidth="7"
              strokeLinecap="round"
              filter="url(#ribbonShadow)"
            />
          )}

          {/* Dimensional Compound Interest Braided Ribbon */}
          {compoundPath && (
            <path
              d={compoundPath}
              fill="none"
              stroke="url(#warmIvoryCurveGrad)"
              strokeWidth="6"
              strokeLinecap="round"
            />
          )}

          {/* Dynamic Traveling Head Node */}
          {drawProgress > 0 && (
            <g transform={`translate(${mapX(currentYear)}, ${mapY(currentCompound)})`}>
              <circle cx="0" cy="0" r="14" fill="#10B981" opacity="0.3" />
              <circle cx="0" cy="0" r="7.5" fill="#047857" stroke="#FAF7F0" strokeWidth="2.5" />
            </g>
          )}

          {/* Year 15 Milestone Plaque */}
          {showYear15 && (
            <g opacity={year15Opacity} transform={`translate(${mapX(15)}, ${mapY(41772)})`}>
              <circle cx="0" cy="0" r="6" fill="#B45309" />
              <line x1="0" y1="0" x2="-24" y2="-64" stroke="#B45309" strokeWidth="1.5" />
              <rect
                x="-280"
                y="-140"
                width="260"
                height="72"
                rx="8"
                fill="#FFFDF8"
                stroke="#B45309"
                strokeWidth="1.8"
                filter="drop-shadow(0 8px 16px rgba(0,0,0,0.08))"
              />
              <text x="-266" y="-115" fill="#B45309" fontSize="14" fontWeight="800" letterSpacing="1">
                YEAR 15 // BAL: $41,772
              </text>
              <text x="-266" y="-94" fill="#1C1917" fontSize="12.5" fontWeight="600">
                Growth ($31,772) &gt; Principal ($10k)
              </text>
              <text x="-266" y="-78" fill="#78716C" fontSize="11" fontStyle="italic">
                (Continuous acceleration)
              </text>
            </g>
          )}

          {/* Year 30 Climax Plaque */}
          {showYear30 && (
            <g opacity={year30Opacity} transform={`translate(${mapX(30)}, ${mapY(174494)})`}>
              <circle cx="0" cy="0" r="8" fill="#D97706" />
              <rect
                x="-290"
                y="-48"
                width="270"
                height="74"
                rx="8"
                fill="#166534"
                stroke="#10B981"
                strokeWidth="2.2"
                filter="drop-shadow(0 12px 24px rgba(22, 101, 52, 0.35))"
              />
              <text x="-274" y="-24" fill="#86EFAC" fontSize="15" fontWeight="800" letterSpacing="1">
                YEAR 30 COMPOUND
              </text>
              <text x="-274" y="12" fill="#FFFFFF" fontSize="30" fontWeight="900" letterSpacing="-0.5">
                $174,494
              </text>
            </g>
          )}
        </svg>
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
            color: '#44403C',
            margin: 0,
            maxWidth: 820,
            fontWeight: 450,
          }}
        >
          Time is not an arithmetic factor. <br />
          <span style={{ color: '#B45309', fontWeight: 700 }}>It is the mathematical exponent</span> that drives the curve.
        </p>
      </div>
    </div>
  );
};
