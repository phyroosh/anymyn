import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene5TheDivergence: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Crossfade transitions
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [425, 450], [1, 0], { extrapolateLeft: 'clamp' });

  // Camera tracking
  const cameraScale = interpolate(frame, [0, 450], [0.94, 1.04], { extrapolateRight: 'clamp' });
  const cameraPanY = interpolate(frame, [0, 450], [20, -15], { extrapolateRight: 'clamp' });

  // 30-year simulation progress over frames 30 to 330
  const simProgress = interpolate(frame, [30, 330], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const currentYear = Math.round(interpolate(simProgress, [0, 1], [0, 30]));

  // Values at current year
  const simpleVal = Math.round(10000 + 1000 * currentYear);
  const compoundVal = Math.round(10000 * Math.pow(1.10, currentYear));

  // Climax reveal spring (frames 330 to 420)
  const climaxSpring = spring({
    frame: frame - 330,
    fps,
    config: { damping: 14, stiffness: 90, mass: 1.0 },
  });
  const climaxOpacity = interpolate(frame, [330, 360], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Calculate curve points for Simple Interest (linear) and Compound Interest (exponential)
  // X: 160 to 920 (width 760)
  // Y: 1380 down to 650 (height 730)
  const simplePoints = [];
  const compoundPoints = [];

  for (let yr = 0; yr <= 30; yr++) {
    const px = 160 + (yr / 30) * 760;
    // Simple: $10k to $40k
    const sBal = 10000 + 1000 * yr;
    const sy = 1380 - ((sBal - 10000) / 165000) * 730;
    simplePoints.push({ x: px, y: sy, yr, val: sBal });

    // Compound: $10k to $174,494
    const cBal = 10000 * Math.pow(1.10, yr);
    const cy = 1380 - ((cBal - 10000) / 165000) * 730;
    compoundPoints.push({ x: px, y: cy, yr, val: cBal });
  }

  const simplePathD = simplePoints.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const compoundPathD = compoundPoints.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Year 30 end coordinates
  const sEnd = simplePoints[30];
  const cEnd = compoundPoints[30];

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: '#070A10',
        position: 'relative',
        overflow: 'hidden',
        opacity: fadeIn * fadeOut,
        fontFamily: '"Cinzel", "Playfair Display", Georgia, serif',
      }}
    >
      {/* Deep Navy Atmosphere */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(1100px circle at 50% 40%, rgba(15, 28, 48, 0.6) 0%, rgba(7, 10, 16, 0.95) 75%, #04060A 100%)',
        }}
      />

      {/* Camera Viewport */}
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${cameraScale}) translateY(${cameraPanY}px)`,
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
              borderBottom: '1px solid rgba(226, 232, 240, 0.2)',
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
              ANYMYN EDITORIAL • CHAPTER V
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
              THE VISCERAL DIVERGENCE
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
            Linear vs. Exponential.
            <br />
            <span style={{ fontStyle: 'italic', fontWeight: 600, color: '#10B981' }}>
              The 4.36× chasm.
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
            Simple interest pays only on your starting seed ($10k). Compounding pays on every dollar ever accumulated—creating an insurmountable divergence.
          </p>
        </div>

        {/* Dynamic Divergence SVG Visualization */}
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
            <linearGradient id="compGlow" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="60%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            <filter id="divGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Baseline grid */}
          <line x1="120" y1="1380" x2="960" y2="1380" stroke="#334155" strokeWidth="1.5" />
          <text x="130" y="1410" fill="#64748B" fontSize="13" fontFamily="system-ui" fontWeight="600">
            YEAR 0 ($10,000 INITIAL CAPITAL)
          </text>
          <text x="860" y="1410" fill="#64748B" fontSize="13" fontFamily="system-ui" fontWeight="600">
            YEAR 30
          </text>

          {/* Simple Interest Trajectory (Linear Muted Rail) */}
          <path
            d={simplePathD}
            fill="none"
            stroke="#64748B"
            strokeWidth="3.5"
            strokeDasharray="2000"
            strokeDashoffset={2000 * (1 - simProgress)}
          />

          {/* Compound Interest Trajectory (Exponential Luminous Helix) */}
          <path
            d={compoundPathD}
            fill="none"
            stroke="url(#compGlow)"
            strokeWidth="9"
            strokeLinecap="round"
            filter="url(#divGlow)"
            strokeDasharray="2000"
            strokeDashoffset={2000 * (1 - simProgress)}
            opacity="0.65"
          />
          <path
            d={compoundPathD}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="2000"
            strokeDashoffset={2000 * (1 - simProgress)}
          />

          {/* Divergence Vertical Measurement Bracket at Year 30 */}
          {climaxOpacity > 0 && (
            <g opacity={climaxOpacity}>
              {/* Vertical connector line */}
              <line
                x1={sEnd.x}
                y1={sEnd.y}
                x2={cEnd.x}
                y2={cEnd.y}
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeDasharray="6,6"
              />
              {/* Bracket tick at Simple Interest */}
              <line x1={sEnd.x - 20} y1={sEnd.y} x2={sEnd.x + 20} y2={sEnd.y} stroke="#64748B" strokeWidth="3" />
              {/* Bracket tick at Compound Interest */}
              <line x1={cEnd.x - 20} y1={cEnd.y} x2={cEnd.x + 20} y2={cEnd.y} stroke="#F59E0B" strokeWidth="3" />

              {/* End Node: Simple Interest */}
              <circle cx={sEnd.x} cy={sEnd.y} r="8" fill="#64748B" />
              {/* End Node: Compound Interest */}
              <circle cx={cEnd.x} cy={cEnd.y} r="10" fill="#F59E0B" filter="url(#divGlow)" />
            </g>
          )}
        </svg>

        {/* Callout Tag: Simple Interest Endpoint */}
        {simProgress > 0.8 && (
          <div
            style={{
              position: 'absolute',
              top: sEnd.y - 25,
              right: 180,
              backgroundColor: 'rgba(30, 41, 59, 0.9)',
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid #475569',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <span style={{ fontFamily: 'system-ui', fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>
              SIMPLE INTEREST (4.00×)
            </span>
            <span style={{ fontFamily: '"Cinzel", Georgia', fontSize: 20, fontWeight: 700, color: '#E2E8F0' }}>
              $40,000
            </span>
          </div>
        )}

        {/* Callout Tag: Compound Interest Endpoint */}
        {simProgress > 0.85 && (
          <div
            style={{
              position: 'absolute',
              top: cEnd.y - 35,
              right: 180,
              backgroundColor: 'rgba(6, 78, 59, 0.95)',
              padding: '10px 20px',
              borderRadius: 12,
              border: '2px solid #10B981',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <span style={{ fontFamily: 'system-ui', fontSize: 11, fontWeight: 800, color: '#A7F3D0', letterSpacing: 1 }}>
              COMPOUND CAPITAL (17.45×)
            </span>
            <span style={{ fontFamily: '"Cinzel", Georgia', fontSize: 26, fontWeight: 700, color: '#FFFFFF' }}>
              $174,494
            </span>
          </div>
        )}

        {/* Monumental Divergence Verdict Badge */}
        {climaxOpacity > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 880,
              left: 120,
              width: 500,
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 20,
              padding: '24px 30px',
              border: '2px solid #F59E0B',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(245, 158, 11, 0.25)',
              opacity: climaxOpacity,
              transform: `scale(${interpolate(climaxSpring, [0, 1], [0.88, 1])})`,
            }}
          >
            <div
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: 3,
                color: '#FDE68A',
                textTransform: 'uppercase',
              }}
            >
              THE CRITICAL VERDICT
            </div>

            <div
              style={{
                fontFamily: '"Cinzel", Georgia, serif',
                fontSize: 48,
                fontWeight: 700,
                color: '#F59E0B',
                margin: '8px 0',
              }}
            >
              4.36×
            </div>

            <div
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 16,
                fontWeight: 700,
                color: '#F8FAFC',
                lineHeight: 1.35,
              }}
            >
              More wealth than simple interest alone.
            </div>

            <div
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 14,
                color: '#94A3B8',
                marginTop: 6,
              }}
            >
              +$134,494 in extra profit created purely by allowing returns to become part of the productive principal.
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
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2,
                color: '#94A3B8',
              }}
            >
              SIMPLE INTEREST
            </div>
            <div
              style={{
                fontFamily: '"Cinzel", Georgia, serif',
                fontSize: 32,
                fontWeight: 700,
                color: '#CBD5E1',
              }}
            >
              ${simpleVal.toLocaleString()}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2,
                color: '#10B981',
              }}
            >
              COMPOUND INTEREST
            </div>
            <div
              style={{
                fontFamily: '"Cinzel", Georgia, serif',
                fontSize: 34,
                fontWeight: 700,
                color: '#10B981',
                textShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
              }}
            >
              ${compoundVal.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
