import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const LookDevFinancialTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 80 },
  });

  // Curve draw progression (from local frame 10 to 75)
  const drawProgress = interpolate(frame, [10, 75], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Elapsed years from 0 to 30 based on drawProgress
  const currentYear = interpolate(drawProgress, [0, 1], [0, 30]);

  // Exact mathematical calculations along the curve
  const p = 10000;
  const r = 0.10;
  const currentSimple = p * (1 + r * currentYear);
  const currentCompound = p * Math.pow(1 + r, currentYear);

  // SVG coordinate mapping inside 9:16 safe area
  // SVG viewBox: 0 0 920 680
  // X: Year 0 (x=80) to Year 30 (x=840)
  // Y: $0 (y=620) to $180,000 (y=60)
  const mapX = (year: number) => 80 + (year / 30) * 760;
  const mapY = (val: number) => 620 - (val / 180000) * 560;

  // Build the SVG path string for Compound Curve up to currentYear
  const sampleSteps = 60;
  const curvePoints: string[] = [];
  for (let i = 0; i <= sampleSteps; i++) {
    const yr = (i / sampleSteps) * currentYear;
    const val = p * Math.pow(1 + r, yr);
    curvePoints.push(`${mapX(yr).toFixed(1)},${mapY(val).toFixed(1)}`);
  }
  const compoundPath = curvePoints.length > 0 ? `M ${curvePoints.join(' L ')}` : '';

  // Simple interest line endpoint
  const simpleEndX = mapX(currentYear);
  const simpleEndY = mapY(currentSimple);

  // Year 15 milestone reveal (at drawProgress >= 0.50, frame >= 42)
  const showYear15 = drawProgress >= 0.5;
  const year15Opacity = interpolate(frame, [42, 52], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Year 30 reveal (frame >= 75)
  const showYear30 = drawProgress >= 0.98;
  const year30Opacity = interpolate(frame, [72, 85], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#07120B',
        backgroundImage: `
          radial-gradient(circle at 65% 35%, rgba(16, 185, 129, 0.14) 0%, rgba(7, 18, 11, 0.96) 75%),
          linear-gradient(180deg, #0A1910 0%, #040906 100%)
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
      {/* Top Editorial Header */}
      <div
        style={{
          borderBottom: '1px solid rgba(16, 185, 129, 0.25)',
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
              color: '#34D399',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 8,
            }}
          >
            THE 30-YEAR HORIZON
          </span>
          <h2
            style={{
              fontSize: 44,
              fontWeight: 800,
              color: '#F4F2EC',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Exponential Divergence
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 16, color: '#9CA3AF', fontFamily: 'monospace' }}>
            ELAPSED TIMELINE
          </span>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#10B981',
              fontFamily: 'monospace',
              marginTop: 4,
            }}
          >
            YEAR {Math.floor(currentYear)} / 30
          </div>
        </div>
      </div>

      {/* Centerpiece: The Exponential Financial Coordinate Canvas */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 680,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          viewBox="0 0 920 680"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'visible',
          }}
        >
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="60%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            <filter id="emeraldGlow" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
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
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="1"
                />
                <text
                  x="70"
                  y={y + 5}
                  textAnchor="end"
                  fill="#6B7280"
                  fontSize="15"
                  fontFamily="monospace"
                >
                  ${val >= 1000 ? `${val / 1000}k` : val}
                </text>
              </g>
            );
          })}

          {/* Year Vertical Grid Markers */}
          {[0, 10, 15, 20, 30].map((yr) => {
            const x = mapX(yr);
            return (
              <g key={yr}>
                <line
                  x1={x}
                  y1="60"
                  x2={x}
                  y2="620"
                  stroke={yr === 15 ? 'rgba(245, 158, 11, 0.35)' : 'rgba(255, 255, 255, 0.06)'}
                  strokeWidth={yr === 15 ? 1.5 : 1}
                  strokeDasharray={yr === 15 ? '4 4' : 'none'}
                />
                <text
                  x={x}
                  y="645"
                  textAnchor="middle"
                  fill={yr === 15 ? '#F59E0B' : '#6B7280'}
                  fontSize="15"
                  fontFamily="monospace"
                  fontWeight={yr === 15 ? '700' : '400'}
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
            strokeWidth="3"
            strokeDasharray="6 6"
          />
          {drawProgress > 0.1 && (
            <text
              x={simpleEndX + 12}
              y={simpleEndY + 4}
              fill="#A8A29E"
              fontSize="16"
              fontFamily="monospace"
              fontWeight="600"
            >
              Simple: ${Math.round(currentSimple).toLocaleString()}
            </text>
          )}

          {/* Exponential Compound Interest Curve */}
          {compoundPath && (
            <path
              d={compoundPath}
              fill="none"
              stroke="url(#curveGradient)"
              strokeWidth="5.5"
              strokeLinecap="round"
              filter="url(#emeraldGlow)"
            />
          )}

          {/* Leading Beacon for Compound Curve */}
          {drawProgress > 0 && (
            <g transform={`translate(${mapX(currentYear)}, ${mapY(currentCompound)})`}>
              <circle cx="0" cy="0" r="16" fill="#10B981" opacity="0.35" filter="url(#emeraldGlow)" />
              <circle cx="0" cy="0" r="8" fill="#34D399" />
              <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" />
            </g>
          )}

          {/* Year 15 Milestone Callout */}
          {showYear15 && (
            <g opacity={year15Opacity} transform={`translate(${mapX(15)}, ${mapY(41772)})`}>
              <circle cx="0" cy="0" r="6.5" fill="#F59E0B" />
              <line x1="0" y1="0" x2="-24" y2="-64" stroke="#F59E0B" strokeWidth="1.5" />
              <rect
                x="-280"
                y="-140"
                width="260"
                height="72"
                rx="8"
                fill="#18140E"
                stroke="#F59E0B"
                strokeWidth="1.8"
              />
              <text x="-266" y="-115" fill="#F59E0B" fontSize="14" fontWeight="800" letterSpacing="1">
                YEAR 15 // BAL: $41,772
              </text>
              <text x="-266" y="-94" fill="#F3F4F6" fontSize="12.5" fontWeight="600">
                Growth ($31,772) &gt; Principal ($10k)
              </text>
              <text x="-266" y="-78" fill="#A8A29E" fontSize="11" fontStyle="italic">
                (Exponential acceleration continues)
              </text>
            </g>
          )}

          {/* Year 30 Ultimate Climax Callout */}
          {showYear30 && (
            <g opacity={year30Opacity} transform={`translate(${mapX(30)}, ${mapY(174494)})`}>
              <circle cx="0" cy="0" r="9" fill="#F59E0B" filter="url(#emeraldGlow)" />
              <rect
                x="-290"
                y="-48"
                width="270"
                height="74"
                rx="8"
                fill="#0C2014"
                stroke="#10B981"
                strokeWidth="2.2"
              />
              <text x="-274" y="-24" fill="#34D399" fontSize="15" fontWeight="800" letterSpacing="1">
                YEAR 30 COMPOUND
              </text>
              <text x="-274" y="12" fill="#FFFFFF" fontSize="30" fontWeight="900" letterSpacing="-0.5">
                $174,494
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Bottom Editorial Verdict Block */}
      <div
        style={{
          borderTop: '1px solid rgba(16, 185, 129, 0.25)',
          paddingTop: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          {/* Simple Result */}
          <div>
            <span style={{ fontSize: 16, color: '#9CA3AF', letterSpacing: '0.1em' }}>
              SIMPLE INTEREST (LINEAR)
            </span>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#D1D5DB', marginTop: 4 }}>
              $40,000{' '}
              <span style={{ fontSize: 18, color: '#9CA3AF', fontWeight: 500 }}>(4.00× principal)</span>
            </div>
          </div>

          {/* Compound Result & Multiplier */}
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 16, color: '#34D399', letterSpacing: '0.1em', fontWeight: 700 }}>
              COMPOUND INTEREST
            </span>
            <div style={{ fontSize: 44, fontWeight: 900, color: '#34D399', marginTop: 4 }}>
              $174,494
            </div>
          </div>
        </div>

        {/* Prominent Multiplier Highlight Statement */}
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: 8,
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 19, fontWeight: 700, color: '#F4F2EC' }}>
            <span style={{ color: '#F59E0B', fontWeight: 800 }}>4.36×</span> the simple-interest ending balance
          </span>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#34D399', fontFamily: 'monospace' }}>
            17.45× CAPITAL MULTIPLIER
          </span>
        </div>

        {/* Required Financial Footnote / Disclaimer */}
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.4,
            color: '#6B7280',
            fontStyle: 'italic',
          }}
        >
          Hypothetical model: $10,000 initial principal, 10% annual return, 30-year horizon, annual compounding.
          Does not account for fees or taxes. Past performance does not guarantee future results.
        </div>
      </div>
    </div>
  );
};
