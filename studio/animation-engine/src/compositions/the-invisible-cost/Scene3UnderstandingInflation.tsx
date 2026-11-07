import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene3UnderstandingInflation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const sceneEntrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 85 },
  });

  // Price level weight expansion & scale tilt (frames 40 to 220)
  const tiltProgress = interpolate(frame, [40, 220], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Balance beam angle (0 deg -> 14 deg tilt to the right)
  const beamAngle = interpolate(tiltProgress, [0, 1], [0, 14]);

  // Price level multiplier (1.00x -> 1.806x)
  const priceMultiplier = interpolate(tiltProgress, [0, 1], [1.0, 1.806]);

  // Price mass scale (1.0x -> 1.55x)
  const rightMassScale = interpolate(tiltProgress, [0, 1], [1.0, 1.55]);

  // Exit fade out (frames 290 to 315)
  const sceneOpacity = interpolate(frame, [290, 315], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: '#110E0C',
        position: 'relative',
        overflow: 'hidden',
        opacity: sceneOpacity,
        fontFamily: '"Cinzel", "Playfair Display", "Times New Roman", serif',
      }}
    >
      {/* Workshop Atmosphere with Warm Golden Overhead Spotlight */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(1100px circle at 50% 32%, rgba(180, 125, 45, 0.22) 0%, rgba(25, 18, 14, 0.95) 60%, rgba(17, 14, 12, 1) 100%)',
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
          Inflation Is A
          <br />
          <span style={{ color: '#E5A93C' }}>Rising Tide.</span>
        </div>

        <div
          style={{
            marginTop: 24,
            fontSize: 44,
            fontWeight: 700,
            color: '#A89F91',
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          Nominal Value vs Real Purchasing Power
        </div>
      </div>

      {/* Mechanical Balance Scale Centerpiece */}
      <div
        style={{
          position: 'absolute',
          top: 660,
          left: 60,
          right: 60,
          height: 820,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
        }}
      >
        <svg width="960" height="720" viewBox="0 0 960 720">
          <defs>
            <linearGradient id="brassGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F5D77F" />
              <stop offset="50%" stopColor="#C49B3B" />
              <stop offset="100%" stopColor="#7A5A18" />
            </linearGradient>
            <linearGradient id="slateGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Central Fulcrum Stand */}
          <path d="M 440 640 L 520 640 L 490 280 L 470 280 Z" fill="url(#brassGrad)" />
          {/* Heavy Base Plinth */}
          <rect x="360" y="630" width="240" height="40" rx="8" fill="#2A2218" stroke="#8A6B29" strokeWidth="3" />
          {/* Fulcrum Pivot Ring */}
          <circle cx="480" cy="275" r="28" fill="#1A1510" stroke="url(#brassGrad)" strokeWidth="6" />
          <circle cx="480" cy="275" r="10" fill="#E5A93C" />

          {/* Tilting Balance Beam Group */}
          <g transform={`rotate(${beamAngle} 480 275)`}>
            {/* The Main Beam */}
            <rect x="120" y="265" width="720" height="20" rx="10" fill="url(#brassGrad)" filter="url(#glowGold)" />

            {/* Left Suspension Point (Nominal Money) */}
            <circle cx="160" cy="275" r="8" fill="#FFFFFF" />
            {/* Left Chains */}
            <line x1="160" y1="275" x2="110" y2="440" stroke="#8A6B29" strokeWidth="2.5" strokeDasharray="6 3" />
            <line x1="160" y1="275" x2="210" y2="440" stroke="#8A6B29" strokeWidth="2.5" strokeDasharray="6 3" />
            {/* Left Pan */}
            <path d="M 90 440 L 230 440 Q 160 480 90 440 Z" fill="url(#brassGrad)" />

            {/* Right Suspension Point (Price Level) */}
            <circle cx="800" cy="275" r="8" fill="#FFFFFF" />
            {/* Right Chains */}
            <line x1="800" y1="275" x2="750" y2="440" stroke="#8A6B29" strokeWidth="2.5" strokeDasharray="6 3" />
            <line x1="800" y1="275" x2="850" y2="440" stroke="#8A6B29" strokeWidth="2.5" strokeDasharray="6 3" />
            {/* Right Pan */}
            <path d="M 730 440 L 870 440 Q 800 480 730 440 Z" fill="url(#brassGrad)" />

            {/* Left Weight: Fixed $100 Gold Ingot */}
            <g transform="translate(160, 420)">
              <rect
                x="-55"
                y="-60"
                width="110"
                height="60"
                rx="6"
                fill="url(#brassGrad)"
                stroke="#FFE082"
                strokeWidth="2"
              />
              <text x="0" y="-32" textAnchor="middle" fill="#1C1508" fontSize="22" fontWeight="900">
                $100.00
              </text>
              <text x="0" y="-12" textAnchor="middle" fill="#42351B" fontSize="13" fontWeight="800" letterSpacing="1">
                NOMINAL
              </text>
            </g>

            {/* Right Weight: Expanding Price Level Weight */}
            <g transform={`translate(800, 420) scale(${rightMassScale})`}>
              <rect
                x="-60"
                y="-75"
                width="120"
                height="75"
                rx="8"
                fill="#831843"
                stroke="#F43F5E"
                strokeWidth="3"
              />
              <text x="0" y="-45" textAnchor="middle" fill="#FFFFFF" fontSize="20" fontWeight="900">
                PRICES
              </text>
              <text x="0" y="-22" textAnchor="middle" fill="#FECDD3" fontSize="18" fontWeight="800">
                {priceMultiplier.toFixed(2)}×
              </text>
            </g>
          </g>
        </svg>

        {/* Dynamic Measurement Banner Below Scale */}
        <div
          style={{
            marginTop: 20,
            display: 'flex',
            justifyContent: 'space-between',
            width: 860,
            gap: 24,
          }}
        >
          {/* Left Status: Nominal Banknote */}
          <div
            style={{
              flex: 1,
              padding: '20px 24px',
              borderRadius: 16,
              backgroundColor: '#1E1B18',
              border: '2px solid #574B39',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: '#A89F91', letterSpacing: 2 }}>NOMINAL BALANCE</div>
            <div style={{ fontSize: 52, fontWeight: 900, color: '#F5D77F', marginTop: 4 }}>$100.00</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#10B981', marginTop: 4 }}>STATIC VALUE</div>
          </div>

          {/* Right Status: Real Price Level */}
          <div
            style={{
              flex: 1,
              padding: '20px 24px',
              borderRadius: 16,
              backgroundColor: '#1F1318',
              border: '2px solid #881337',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: '#FDA4AF', letterSpacing: 2 }}>GENERAL PRICE LEVEL</div>
            <div style={{ fontSize: 52, fontWeight: 900, color: '#F43F5E', marginTop: 4 }}>
              +{((priceMultiplier - 1) * 100).toFixed(1)}%
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#FDA4AF', marginTop: 4 }}>
              REQUIRES ${(100 * priceMultiplier).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
