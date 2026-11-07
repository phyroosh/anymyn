import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Shot3TimePassesV2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const sceneEntrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 85 },
  });

  // 20-year progression (frames 40 to 420)
  const timeProgress = interpolate(frame, [40, 420], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Current year counter (0 -> 20)
  const currentYear = Math.round(interpolate(timeProgress, [0, 1], [0, 20]));

  // Balance beam angle (0 deg -> 12 deg tilt to the right)
  const beamAngle = interpolate(timeProgress, [0, 1], [0, 12]);

  // Price mass scale (1.0x -> 1.55x)
  const rightMassScale = interpolate(timeProgress, [0, 1], [1.0, 1.55]);

  // Scene exit fade out (frames 480 to 510)
  const sceneOpacity = interpolate(frame, [480, 510], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: '#12141C',
        position: 'relative',
        overflow: 'hidden',
        opacity: sceneOpacity,
        fontFamily: '"Cinzel", "Playfair Display", "Times New Roman", serif',
      }}
    >
      {/* Workshop Atmosphere with Warm Amber Overhead Spotlight */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(1100px circle at 50% 34%, rgba(217, 145, 50, 0.22) 0%, rgba(22, 25, 36, 0.95) 60%, rgba(14, 16, 24, 1) 100%)',
        }}
      />

      {/* Atmospheric directional shadow */}
      <div
        style={{
          position: 'absolute',
          top: 1300,
          left: 100,
          width: 880,
          height: 140,
          background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.6) 0%, rgba(14, 16, 24, 0) 70%)',
          filter: 'blur(35px)',
        }}
      />

      {/* Hero Motion Typography — ONE SHOT. ONE IDEA. */}
      <div
        style={{
          position: 'absolute',
          top: 230,
          left: 80,
          right: 80,
          textAlign: 'center',
          zIndex: 30,
        }}
      >
        <div
          style={{
            fontSize: 78,
            fontWeight: 800,
            lineHeight: 1.12,
            color: '#F4F2EC',
            letterSpacing: -1.5,
            textTransform: 'uppercase',
            opacity: sceneEntrance,
          }}
        >
          Prices Rise.
          <br />
          <span style={{ color: '#E5A93C' }}>The Bill Does Not.</span>
        </div>

        {/* Dynamic Year Progress Tracker */}
        <div
          style={{
            marginTop: 32,
            display: 'inline-flex',
            alignItems: 'center',
            padding: '12px 36px',
            borderRadius: 30,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '2px solid rgba(229, 169, 60, 0.35)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          }}
        >
          <span
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: '#F5D77F',
              fontFamily: 'monospace',
              letterSpacing: 4,
            }}
          >
            YEAR {currentYear} OF 20
          </span>
        </div>
      </div>

      {/* Central Balance Scale Assembly */}
      <div
        style={{
          position: 'absolute',
          top: 660,
          left: 60,
          right: 60,
          height: 800,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
        }}
      >
        <svg width="960" height="720" viewBox="0 0 960 720">
          <defs>
            <linearGradient id="brassGradV2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F5D77F" />
              <stop offset="50%" stopColor="#C49B3B" />
              <stop offset="100%" stopColor="#7A5A18" />
            </linearGradient>
            <linearGradient id="steelGradV2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="crimsonGradV2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#991B1B" />
            </linearGradient>
          </defs>

          {/* Central Pedestal / Base Pillar */}
          <rect x="465" y="320" width="30" height="340" rx="6" fill="url(#brassGradV2)" stroke="#543D0F" strokeWidth="3" />
          <polygon points="430,660 530,660 500,640 460,640" fill="url(#brassGradV2)" />
          <rect x="380" y="660" width="200" height="30" rx="8" fill="url(#brassGradV2)" stroke="#543D0F" strokeWidth="3" />

          {/* Center Fulcrum Pin */}
          <circle cx="480" cy="320" r="26" fill="#FDE68A" stroke="#543D0F" strokeWidth="4" />
          <circle cx="480" cy="320" r="10" fill="#78350F" />

          {/* Pivoting Scale Beam */}
          <g transform={`rotate(${beamAngle}, 480, 320)`}>
            {/* The Main Beam */}
            <rect x="80" y="312" width="800" height="16" rx="8" fill="url(#brassGradV2)" stroke="#543D0F" strokeWidth="2.5" />
            <circle cx="120" cy="320" r="14" fill="#FDE68A" stroke="#543D0F" strokeWidth="3" />
            <circle cx="840" cy="320" r="14" fill="#FDE68A" stroke="#543D0F" strokeWidth="3" />

            {/* LEFT PAN SUSPENSION (Banknote Side) */}
            <g transform={`rotate(${-beamAngle}, 120, 320)`}>
              <line x1="120" y1="320" x2="80" y2="450" stroke="#C49B3B" strokeWidth="3" />
              <line x1="120" y1="320" x2="160" y2="450" stroke="#C49B3B" strokeWidth="3" />
              {/* Left Weighing Pan */}
              <ellipse cx="120" cy="455" rx="100" ry="24" fill="url(#steelGradV2)" stroke="#334155" strokeWidth="2.5" />

              {/* UNCHANGED $100 BANKNOTE ON LEFT PAN */}
              <g transform="translate(45, 380)">
                <rect
                  x="0"
                  y="0"
                  width="150"
                  height="75"
                  rx="6"
                  fill="#DFDAC9"
                  stroke="#6B624D"
                  strokeWidth="2.5"
                />
                <rect x="40" y="0" width="10" height="75" fill="#3B82F6" opacity="0.8" />
                <text x="75" y="48" fill="#1F1C15" fontSize="28" fontWeight="900" textAnchor="middle" fontFamily="serif">
                  $100
                </text>
              </g>
              <text x="120" y="515" fill="#FDE68A" fontSize="22" fontWeight="800" textAnchor="middle" letterSpacing="2">
                UNCHANGED
              </text>
            </g>

            {/* RIGHT PAN SUSPENSION (Price Weight Side) */}
            <g transform={`rotate(${-beamAngle}, 840, 320)`}>
              <line x1="840" y1="320" x2="800" y2="450" stroke="#C49B3B" strokeWidth="3" />
              <line x1="840" y1="320" x2="880" y2="450" stroke="#C49B3B" strokeWidth="3" />
              {/* Right Weighing Pan */}
              <ellipse cx="840" cy="455" rx="100" ry="24" fill="url(#steelGradV2)" stroke="#334155" strokeWidth="2.5" />

              {/* EXPANDING PRICE MASS ON RIGHT PAN */}
              <g transform={`translate(840, 440) scale(${rightMassScale}) translate(-50, -60)`}>
                <rect
                  x="0"
                  y="0"
                  width="100"
                  height="60"
                  rx="8"
                  fill="url(#crimsonGradV2)"
                  stroke="#7F1D1D"
                  strokeWidth="2.5"
                />
                <text x="50" y="38" fill="#FFFFFF" fontSize="22" fontWeight="900" textAnchor="middle">
                  PRICES
                </text>
              </g>
              <text x="840" y="515" fill="#F87171" fontSize="22" fontWeight="800" textAnchor="middle" letterSpacing="2">
                RISING (+80%)
              </text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};
