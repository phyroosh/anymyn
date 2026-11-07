import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene4NumericalReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const sceneEntrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 85 },
  });

  // 20-year timeline interpolation (frames 45 to 260)
  const currentYear = interpolate(frame, [45, 260], [0, 20], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Calculate dynamic values for current year based on (1.03)^t
  const priceFactor = Math.pow(1.03, currentYear);
  const basketCost = 100 * priceFactor;
  const purchasingPower = 100 / priceFactor;
  const pctLoss = (1 - 1 / priceFactor) * 100;

  // Reveal pulse on final $55.37 climax (frame 260 onwards)
  const climaxPulse = spring({
    frame: frame - 260,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Exit fade out (frames 380 to 405)
  const sceneOpacity = interpolate(frame, [380, 405], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Chart coordinates mapping (Width: 840, Height: 320)
  // X: 0 to 840 maps to Year 0 to 20
  // Y: 0 to 320 maps to $100 to $50
  const points: [number, number][] = [];
  const totalSteps = 40;
  for (let i = 0; i <= totalSteps; i++) {
    const yStep = (i / totalSteps) * 20;
    if (yStep <= currentYear) {
      const x = (yStep / 20) * 800;
      const pp = 100 / Math.pow(1.03, yStep);
      // Map pp ($100 to $55) into chart height (0 to 260)
      const y = ((100 - pp) / (100 - 50)) * 240;
      points.push([x, y]);
    }
  }

  const pathD =
    points.length > 0
      ? `M ${points[0][0]} ${points[0][1]} ` +
        points.slice(1).map((p) => `L ${p[0]} ${p[1]}`).join(' ')
      : '';

  const headPoint = points.length > 0 ? points[points.length - 1] : [0, 0];

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: '#090C12',
        position: 'relative',
        overflow: 'hidden',
        opacity: sceneOpacity,
        fontFamily: '"Cinzel", "Playfair Display", "Times New Roman", serif',
      }}
    >
      {/* Deep Obsidian & Indigo Observatory Grid Atmosphere */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(1100px circle at 50% 38%, rgba(29, 38, 59, 0.5) 0%, rgba(10, 13, 20, 0.95) 70%, rgba(6, 8, 12, 1) 100%)',
        }}
      />

      {/* Hero Motion Typography */}
      <div
        style={{
          position: 'absolute',
          top: 210,
          left: 80,
          right: 80,
          textAlign: 'center',
          zIndex: 30,
        }}
      >
        <div
          style={{
            fontSize: 84,
            fontWeight: 800,
            lineHeight: 1.08,
            color: '#F4F2EC',
            letterSpacing: -1.5,
            textTransform: 'uppercase',
            opacity: sceneEntrance,
          }}
        >
          Compounding
          <br />
          <span style={{ color: '#F87171' }}>Cuts Value In Half.</span>
        </div>

        {/* Formula Pill */}
        <div
          style={{
            marginTop: 20,
            display: 'inline-flex',
            alignItems: 'center',
            padding: '8px 24px',
            borderRadius: 30,
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            border: '2px solid rgba(56, 189, 248, 0.4)',
            gap: 16,
          }}
        >
          <span style={{ fontSize: 24, fontWeight: 700, color: '#94A3B8', letterSpacing: 2 }}>
            ANNUAL INFLATION: 3.0%
          </span>
          <span style={{ fontSize: 24, fontWeight: 900, color: '#38BDF8', fontFamily: 'monospace' }}>
            (1.03)²⁰ ≈ 1.806
          </span>
        </div>
      </div>

      {/* Main Coordinate Dashboard & Live Counter */}
      <div
        style={{
          position: 'absolute',
          top: 590,
          left: 80,
          right: 80,
          height: 980,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 20,
        }}
      >
        {/* Dynamic Year Progress Readout */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: '16px 28px',
            borderRadius: 16,
            backgroundColor: '#131B28',
            border: '2px solid #1E293B',
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 800, color: '#38BDF8', letterSpacing: 3 }}>
            YEAR {Math.floor(currentYear)} OF 20
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#94A3B8' }}>
            PRICE LEVEL: <span style={{ color: '#F43F5E', fontWeight: 900 }}>{priceFactor.toFixed(3)}×</span>
          </div>
        </div>

        {/* Monumental Dual Numbers */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 20,
            marginTop: 20,
          }}
        >
          {/* Static Nominal Amount */}
          <div
            style={{
              flex: 1,
              padding: '28px 24px',
              borderRadius: 20,
              backgroundColor: '#111827',
              border: '2px solid #374151',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: '#9CA3AF', letterSpacing: 2 }}>
              NOMINAL BALANCE
            </div>
            <div style={{ fontSize: 78, fontWeight: 900, color: '#F3F4F6', fontFamily: 'monospace', marginTop: 8 }}>
              $100.00
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#10B981', marginTop: 4 }}>
              Zero Nominal Loss
            </div>
          </div>

          {/* Collapsing Real Purchasing Power */}
          <div
            style={{
              flex: 1,
              padding: '28px 24px',
              borderRadius: 20,
              backgroundColor: '#1F1318',
              border: '2px solid #E11D48',
              textAlign: 'center',
              boxShadow: climaxPulse > 0.05 ? '0 0 35px rgba(225, 29, 72, 0.35)' : 'none',
              transform: `scale(${1 + climaxPulse * 0.04})`,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: '#FDA4AF', letterSpacing: 2 }}>
              REAL PURCHASING POWER
            </div>
            <div style={{ fontSize: 78, fontWeight: 900, color: '#F43F5E', fontFamily: 'monospace', marginTop: 8 }}>
              ${purchasingPower.toFixed(2)}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#FDA4AF', marginTop: 4 }}>
              -{pctLoss.toFixed(1)}% Real Value
            </div>
          </div>
        </div>

        {/* 20-Year Purchasing Power Erosion Trajectory (SVG Chart) */}
        <div
          style={{
            width: '100%',
            height: 380,
            borderRadius: 20,
            backgroundColor: '#0F172A',
            border: '2px solid #1E293B',
            padding: '24px 30px',
            position: 'relative',
            marginTop: 20,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#94A3B8', letterSpacing: 2 }}>
              20-YEAR EROSION TRAJECTORY
            </span>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#F43F5E' }}>
              FUTURE BASKET: ${basketCost.toFixed(2)}
            </span>
          </div>

          <svg width="860" height="280" viewBox="0 0 860 280" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="curveGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            <line x1="40" y1="20" x2="820" y2="20" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
            <text x="30" y="24" fill="#64748B" fontSize="16" textAnchor="end">$100</text>

            <line x1="40" y1="80" x2="820" y2="80" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
            <text x="30" y="84" fill="#64748B" fontSize="16" textAnchor="end">$85</text>

            <line x1="40" y1="140" x2="820" y2="140" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
            <text x="30" y="144" fill="#64748B" fontSize="16" textAnchor="end">$70</text>

            <line x1="40" y1="200" x2="820" y2="200" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
            <text x="30" y="204" fill="#64748B" fontSize="16" textAnchor="end">$55</text>

            {/* Year X Ticks */}
            <text x="40" y="240" fill="#64748B" fontSize="16" textAnchor="middle">Yr 0</text>
            <text x="235" y="240" fill="#64748B" fontSize="16" textAnchor="middle">Yr 5</text>
            <text x="430" y="240" fill="#64748B" fontSize="16" textAnchor="middle">Yr 10</text>
            <text x="625" y="240" fill="#64748B" fontSize="16" textAnchor="middle">Yr 15</text>
            <text x="820" y="240" fill="#64748B" fontSize="16" textAnchor="middle">Yr 20</text>

            {/* Plotted Trajectory */}
            <g transform="translate(40, 20)">
              {pathD && <path d={pathD} fill="none" stroke="url(#curveGrad)" strokeWidth="5" strokeLinecap="round" />}
              {/* Traveling Beacon */}
              <circle cx={headPoint[0]} cy={headPoint[1]} r="9" fill="#FFFFFF" stroke="#EF4444" strokeWidth="3" />
              <circle cx={headPoint[0]} cy={headPoint[1]} r="18" fill="rgba(239, 68, 68, 0.25)" />
            </g>
          </svg>
        </div>

        {/* Milestone Impact Pill */}
        <div
          style={{
            marginTop: 20,
            padding: '16px 36px',
            borderRadius: 30,
            backgroundColor: '#881337',
            border: '2px solid #F43F5E',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <span style={{ fontSize: 32, fontWeight: 900, color: '#FFFFFF', letterSpacing: 2 }}>
            −44.6% PURCHASING POWER DISSOLVED
          </span>
        </div>
      </div>
    </div>
  );
};
