import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene4TimeObservatory: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Crossfade transitions
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [395, 420], [1, 0], { extrapolateLeft: 'clamp' });

  // Camera tracking motion
  const cameraX = interpolate(frame, [0, 420], [-30, 20], { extrapolateRight: 'clamp' });
  const cameraScale = interpolate(frame, [0, 420], [0.94, 1.04], { extrapolateRight: 'clamp' });

  // Trajectory draw progress (0 to 1 over frames 30 to 360)
  const trajectoryProgress = interpolate(frame, [30, 360], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Current year counter (0 to 18 over frames 30 to 360)
  const currentYear = Math.round(interpolate(trajectoryProgress, [0, 1], [0, 18]));
  // Compounding balance: 10000 * 1.10^t
  const currentBalance = Math.round(10000 * Math.pow(1.10, currentYear));

  // Year 15 Milestone Monument Reveal (frames 230 to 320)
  const y15Spring = spring({
    frame: frame - 230,
    fps,
    config: { damping: 16, stiffness: 90, mass: 1.0 },
  });
  const y15PillarHeight = interpolate(y15Spring, [0, 1], [0, 280]);
  const y15Opacity = interpolate(frame, [230, 255], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // SVG Curve Coordinate mapping (Years 0 to 18)
  // X: 140 to 940 (width 800)
  // Y: 1350 down to 720 (height 630)
  const points = [];
  for (let yr = 0; yr <= 18; yr++) {
    const px = 140 + (yr / 18) * 800;
    const bal = 10000 * Math.pow(1.10, yr);
    // Normalized Y where $10k is at y=1350, and $55k is at y=720
    const py = 1350 - ((bal - 10000) / 45600) * 630;
    points.push({ x: px, y: py, yr, bal });
  }

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Year 15 point
  const ptY15 = points[15];

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: '#080C12',
        position: 'relative',
        overflow: 'hidden',
        opacity: fadeIn * fadeOut,
        fontFamily: '"Cinzel", "Playfair Display", Georgia, serif',
      }}
    >
      {/* Volumetric Midnight Observatory Lighting */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(1100px circle at 50% 35%, rgba(20, 35, 55, 0.5) 0%, rgba(10, 14, 22, 0.95) 75%, #05070A 100%)',
        }}
      />

      {/* Volumetric vertical light columns */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 380,
          width: 320,
          height: 1920,
          background: 'linear-gradient(180deg, rgba(220, 235, 255, 0.05) 0%, rgba(16, 185, 129, 0.03) 60%, transparent 100%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      {/* Mathematical Horizon Gridlines */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: 1080,
          height: 1920,
          opacity: 0.25,
          pointerEvents: 'none',
        }}
      >
        <line x1="100" y1="1350" x2="980" y2="1350" stroke="#475569" strokeWidth="1.5" />
        <line x1="100" y1="1170" x2="980" y2="1170" stroke="#334155" strokeWidth="1" strokeDasharray="4,6" />
        <line x1="100" y1="960" x2="980" y2="960" stroke="#334155" strokeWidth="1" strokeDasharray="4,6" />
        <line x1="100" y1="750" x2="980" y2="750" stroke="#334155" strokeWidth="1" strokeDasharray="4,6" />

        {/* Labels on Y axis */}
        <text x="110" y="1340" fill="#64748B" fontSize="13" fontFamily="system-ui" fontWeight="600">
          $10,000 (BASE)
        </text>
        <text x="110" y="1160" fill="#64748B" fontSize="13" fontFamily="system-ui" fontWeight="600">
          $20,000
        </text>
        <text x="110" y="950" fill="#64748B" fontSize="13" fontFamily="system-ui" fontWeight="600">
          $35,000
        </text>
        <text x="110" y="740" fill="#10B981" fontSize="13" fontFamily="system-ui" fontWeight="700">
          $50,000+
        </text>
      </svg>

      {/* Camera Viewport */}
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${cameraScale}) translateX(${cameraX}px)`,
          position: 'relative',
        }}
      >
        {/* Header Block */}
        <div
          style={{
            position: 'absolute',
            top: 180,
            left: 90,
            right: 90,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(148, 163, 184, 0.25)',
              paddingBottom: 14,
            }}
          >
            <span
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 4,
                color: '#38BDF8',
                textTransform: 'uppercase',
              }}
            >
              ANYMYN EDITORIAL • CHAPTER IV
            </span>
            <span
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: 2,
                color: '#94A3B8',
              }}
            >
              THE ACCUMULATION ARC
            </span>
          </div>

          <h2
            style={{
              margin: '22px 0 0 0',
              fontSize: 52,
              fontWeight: 400,
              lineHeight: 1.15,
              color: '#F8FAFC',
            }}
          >
            Time Changes Everything.
            <br />
            <span style={{ fontStyle: 'italic', fontWeight: 600, color: '#38BDF8' }}>
              The curve takes flight.
            </span>
          </h2>

          <p
            style={{
              margin: '12px 0 0 0',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: 20,
              color: '#94A3B8',
              lineHeight: 1.45,
            }}
          >
            Early progress feels ordinary. But compounding builds silently. By Year 15, cumulative returns surpass the initial principal by threefold.
          </p>
        </div>

        {/* Dynamic Trajectory Curve Visualization */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: 1080,
            height: 1920,
            pointerEvents: 'none',
          }}
        >
          <defs>
            <linearGradient id="curveGlow" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="60%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Underlay glow curve */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#curveGlow)"
            strokeWidth="8"
            strokeLinecap="round"
            filter="url(#glowFilter)"
            strokeDasharray="1600"
            strokeDashoffset={1600 * (1 - trajectoryProgress)}
            opacity="0.6"
          />

          {/* Sharp core ribbon */}
          <path
            d={pathD}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="1600"
            strokeDashoffset={1600 * (1 - trajectoryProgress)}
          />

          {/* Year 10 checkpoint node */}
          {trajectoryProgress > 0.55 && (
            <g transform={`translate(${points[10].x}, ${points[10].y})`}>
              <circle r="7" fill="#38BDF8" />
              <circle r="14" fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.6" />
              <text x="16" y="5" fill="#E2E8F0" fontSize="15" fontFamily="system-ui" fontWeight="700">
                YR 10: $25,937
              </text>
            </g>
          )}

          {/* Year 15 Milestone Monument Marker */}
          {y15Opacity > 0 && (
            <g transform={`translate(${ptY15.x}, ${ptY15.y})`}>
              {/* Vertical pillar from baseline up to curve point */}
              <line
                x1="0"
                y1={1350 - ptY15.y}
                x2="0"
                y2="0"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeDasharray="4,4"
                opacity={y15Opacity}
              />
              <circle r="9" fill="#F59E0B" filter="url(#glowFilter)" />
              <circle r="18" fill="none" stroke="#FDE68A" strokeWidth="2" opacity={y15Opacity} />
            </g>
          )}
        </svg>

        {/* Year 15 Architectural Plaque */}
        {y15Opacity > 0 && (
          <div
            style={{
              position: 'absolute',
              top: ptY15.y - 170,
              left: ptY15.x - 220,
              width: 440,
              backgroundColor: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(16px)',
              borderRadius: 16,
              padding: '18px 24px',
              border: '2px solid #F59E0B',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(245, 158, 11, 0.35)',
              opacity: y15Opacity,
              transform: `scale(${interpolate(y15Spring, [0, 1], [0.85, 1])})`,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
                paddingBottom: 8,
              }}
            >
              <span
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: 2.5,
                  color: '#FDE68A',
                }}
              >
                MILESTONE • YEAR 15
              </span>
              <span
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#10B981',
                }}
              >
                +317% GROWTH
              </span>
            </div>

            <div
              style={{
                fontFamily: '"Cinzel", Georgia, serif',
                fontSize: 34,
                fontWeight: 700,
                color: '#FFFFFF',
                margin: '10px 0 4px 0',
              }}
            >
              $41,772.48
            </div>

            <div
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 13.5,
                fontWeight: 600,
                color: '#CBD5E1',
                lineHeight: 1.4,
              }}
            >
              Cumulative profit ($31,772) exceeds 3× the initial principal.
              <br />
              <span style={{ color: '#F59E0B', fontWeight: 700 }}>
                Single-year return now surpasses $3,790/year.
              </span>
            </div>
          </div>
        )}

        {/* Live HUD Tracker at bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 220,
            left: 90,
            right: 90,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px)',
            borderRadius: 18,
            padding: '22px 32px',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 2.5,
                color: '#38BDF8',
              }}
            >
              TIMELINE ELAPSED
            </div>
            <div
              style={{
                fontFamily: '"Cinzel", Georgia, serif',
                fontSize: 38,
                fontWeight: 700,
                color: '#F8FAFC',
              }}
            >
              YEAR {currentYear} OF 30
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 2.5,
                color: '#10B981',
              }}
            >
              ACCUMULATED CAPITAL
            </div>
            <div
              style={{
                fontFamily: '"Cinzel", Georgia, serif',
                fontSize: 38,
                fontWeight: 700,
                color: '#10B981',
                textShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
              }}
            >
              ${currentBalance.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
