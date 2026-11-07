import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Shot4TheSameBasketV2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const sceneEntrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 80 },
  });

  // Price roll-up animation ($100.00 -> $180.61 between frame 30 and 180)
  const priceProgress = interpolate(frame, [30, 180], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const currentPrice = interpolate(priceProgress, [0, 1], [100.00, 180.61]);

  // Price tag swing & pulse
  const tagSwing = interpolate(
    Math.sin((frame / 18) * Math.PI),
    [-1, 1],
    [-3, 3]
  );
  const pulseScale = spring({
    frame: frame - 180,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Scene exit fade out (frames 335 to 360)
  const sceneOpacity = interpolate(frame, [335, 360], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: '#0A0D16',
        position: 'relative',
        overflow: 'hidden',
        opacity: sceneOpacity,
        fontFamily: '"Cinzel", "Playfair Display", "Times New Roman", serif',
      }}
    >
      {/* Deep Indigo Observatory Atmosphere */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(1100px circle at 50% 36%, rgba(30, 48, 80, 0.45) 0%, rgba(10, 13, 22, 0.95) 65%, rgba(6, 8, 14, 1) 100%)',
        }}
      />

      {/* Atmospheric directional shadow */}
      <div
        style={{
          position: 'absolute',
          top: 1300,
          left: 140,
          width: 800,
          height: 120,
          background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.7) 0%, rgba(6, 8, 14, 0) 70%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Hero Motion Headline — ONE SHOT. ONE IDEA. */}
      <div
        style={{
          position: 'absolute',
          top: 240,
          left: 80,
          right: 80,
          textAlign: 'center',
          zIndex: 30,
        }}
      >
        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.1,
            color: '#F1F5F9',
            letterSpacing: -1.5,
            textTransform: 'uppercase',
            opacity: sceneEntrance,
          }}
        >
          The Same Basket
          <br />
          <span style={{ color: '#F59E0B' }}>Now Costs More.</span>
        </div>
      </div>

      {/* Central Visual Focus: The Exact Same Physical Basket with Giant Price Tag */}
      <div
        style={{
          position: 'absolute',
          top: 560,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${sceneEntrance})`,
          zIndex: 20,
        }}
      >
        <svg width="780" height="640" viewBox="0 0 780 640" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="basketGradS4" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C49B58" />
              <stop offset="50%" stopColor="#A47B3E" />
              <stop offset="100%" stopColor="#755223" />
            </linearGradient>
            <linearGradient id="wickerWeaveS4" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#D4AB68" />
              <stop offset="50%" stopColor="#8C6228" />
              <stop offset="100%" stopColor="#C49B58" />
            </linearGradient>
            <linearGradient id="baguetteGradS4" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E2A755" />
              <stop offset="50%" stopColor="#C68532" />
              <stop offset="100%" stopColor="#8A5116" />
            </linearGradient>
            <linearGradient id="milkGradS4" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#F1EFEA" />
              <stop offset="100%" stopColor="#D6D1C4" />
            </linearGradient>
            <linearGradient id="appleGradS4" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="60%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#7F1D1D" />
            </linearGradient>
          </defs>

          {/* Cast Shadow under Basket */}
          <ellipse cx="390" cy="580" rx="320" ry="45" fill="rgba(0, 0, 0, 0.5)" filter="blur(16px)" />

          {/* GROCERY CONTENTS */}
          <g transform="translate(0, -20)">
            <path
              d="M 230 400 L 150 160 C 145 140 170 125 190 135 L 270 380 Z"
              fill="url(#baguetteGradS4)"
              stroke="#683A09"
              strokeWidth="2.5"
            />
            <line x1="168" y1="180" x2="188" y2="195" stroke="#FFE3B8" strokeWidth="4" strokeLinecap="round" />
            <line x1="185" y1="230" x2="208" y2="248" stroke="#FFE3B8" strokeWidth="4" strokeLinecap="round" />
            <line x1="205" y1="280" x2="230" y2="300" stroke="#FFE3B8" strokeWidth="4" strokeLinecap="round" />

            <rect x="290" y="180" width="110" height="230" rx="18" fill="url(#milkGradS4)" stroke="#BBB4A2" strokeWidth="2" />
            <rect x="320" y="145" width="50" height="40" rx="6" fill="#3B82F6" />
            <rect x="300" y="240" width="90" height="80" rx="6" fill="#EBF4FF" />
            <text x="345" y="285" fill="#1E40AF" fontSize="22" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
              MILK
            </text>

            <rect x="420" y="160" width="130" height="250" rx="12" fill="#EAB308" stroke="#A16207" strokeWidth="2" />
            <rect x="435" y="190" width="100" height="70" rx="6" fill="#FEF08A" />
            <text x="485" y="235" fill="#854D0E" fontSize="20" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
              OATS
            </text>

            <circle cx="280" cy="400" r="48" fill="url(#appleGradS4)" stroke="#991B1B" strokeWidth="2" />
            <circle cx="360" cy="410" r="44" fill="url(#appleGradS4)" stroke="#991B1B" strokeWidth="2" />

            <rect x="480" y="360" width="160" height="85" rx="14" fill="#D6CDB8" stroke="#8A7E65" strokeWidth="2.5" />
            <text x="560" y="412" fill="#574E38" fontSize="20" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
              EGGS
            </text>
          </g>

          {/* WICKER BASKET BODY */}
          <path
            d="M 140 350 L 210 560 C 215 575 230 585 250 585 L 530 585 C 550 585 565 575 570 560 L 640 350 Z"
            fill="url(#basketGradS4)"
            stroke="#593D15"
            strokeWidth="5"
          />

          <path d="M 180 355 L 240 580" stroke="url(#wickerWeaveS4)" strokeWidth="8" strokeLinecap="round" />
          <path d="M 240 355 L 285 580" stroke="url(#wickerWeaveS4)" strokeWidth="8" strokeLinecap="round" />
          <path d="M 310 355 L 340 580" stroke="url(#wickerWeaveS4)" strokeWidth="8" strokeLinecap="round" />
          <path d="M 390 355 L 390 580" stroke="url(#wickerWeaveS4)" strokeWidth="8" strokeLinecap="round" />
          <path d="M 470 355 L 440 580" stroke="url(#wickerWeaveS4)" strokeWidth="8" strokeLinecap="round" />
          <path d="M 540 355 L 495 580" stroke="url(#wickerWeaveS4)" strokeWidth="8" strokeLinecap="round" />
          <path d="M 600 355 L 540 580" stroke="url(#wickerWeaveS4)" strokeWidth="8" strokeLinecap="round" />

          <path d="M 160 410 Q 390 435 620 410" fill="none" stroke="#5E4018" strokeWidth="6" />
          <path d="M 180 470 Q 390 495 600 470" fill="none" stroke="#5E4018" strokeWidth="6" />
          <path d="M 200 530 Q 390 550 580 530" fill="none" stroke="#5E4018" strokeWidth="6" />

          <rect x="120" y="340" width="540" height="24" rx="12" fill="#E2BA72" stroke="#593D15" strokeWidth="4" />

          {/* Sturdy Braided Handle */}
          <path
            d="M 220 345 C 220 180, 560 180, 560 345"
            fill="none"
            stroke="#A47B3E"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d="M 220 345 C 220 180, 560 180, 560 345"
            fill="none"
            stroke="#593D15"
            strokeWidth="4"
            strokeDasharray="16 16"
          />
        </svg>

        {/* HERO PRICE TAG — THE ONLY NUMBER THAT MATTERS IN THIS SHOT */}
        <div
          style={{
            marginTop: 30,
            transform: `rotate(${tagSwing}deg) scale(${1 + pulseScale * 0.08})`,
            transformOrigin: 'top center',
          }}
        >
          <div
            style={{
              padding: '24px 56px',
              borderRadius: 24,
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              border: '3px solid #F59E0B',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 35px rgba(245, 158, 11, 0.25)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: '#94A3B8',
                letterSpacing: 4,
                textTransform: 'uppercase',
              }}
            >
              PRICE 20 YEARS LATER
            </div>
            <div
              style={{
                fontSize: 116,
                fontWeight: 900,
                color: '#F59E0B',
                fontFamily: 'serif',
                lineHeight: 1.0,
                marginTop: 8,
              }}
            >
              ${currentPrice.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
