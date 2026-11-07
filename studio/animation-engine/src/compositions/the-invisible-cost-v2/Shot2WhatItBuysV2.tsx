import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Shot2WhatItBuysV2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const sceneEntrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 80 },
  });

  // Camera slow push-in
  const cameraScale = interpolate(frame, [0, 300], [0.96, 1.04], {
    extrapolateRight: 'clamp',
  });

  // Scene exit fade
  const sceneOpacity = interpolate(frame, [280, 300], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: '#F4EFE6',
        position: 'relative',
        overflow: 'hidden',
        opacity: sceneOpacity,
        fontFamily: '"Cinzel", "Playfair Display", "Times New Roman", serif',
      }}
    >
      {/* Background Soft Gallery Illumination */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(1100px circle at 50% 36%, rgba(255, 255, 255, 0.96) 0%, rgba(244, 239, 230, 0.90) 55%, rgba(230, 222, 208, 0.85) 100%)',
        }}
      />

      {/* Atmospheric Plinth Occlusion Shadow */}
      <div
        style={{
          position: 'absolute',
          top: 1320,
          left: 140,
          width: 800,
          height: 120,
          background: 'radial-gradient(ellipse at center, rgba(120, 105, 85, 0.35) 0%, rgba(244, 239, 230, 0) 70%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Monumental Hero Headline — ONE SHOT. ONE IDEA. */}
      <div
        style={{
          position: 'absolute',
          top: 250,
          left: 80,
          right: 80,
          textAlign: 'center',
          zIndex: 30,
        }}
      >
        <div
          style={{
            fontSize: 86,
            fontWeight: 800,
            lineHeight: 1.1,
            color: '#141416',
            letterSpacing: -1.5,
            textTransform: 'uppercase',
            opacity: sceneEntrance,
            transform: `translateY(${(1 - sceneEntrance) * 30}px)`,
          }}
        >
          Today, It Buys This.
        </div>
      </div>

      {/* Central Visual Focus: The Physical Grocery Basket & The $100 Bill */}
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
          transform: `scale(${sceneEntrance * cameraScale})`,
          zIndex: 20,
        }}
      >
        {/* Physical Grocery Basket SVG */}
        <svg width="780" height="640" viewBox="0 0 780 640" style={{ overflow: 'visible' }}>
          <defs>
            {/* Basket Wicker Gradients */}
            <linearGradient id="basketGradV2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C49B58" />
              <stop offset="50%" stopColor="#A47B3E" />
              <stop offset="100%" stopColor="#755223" />
            </linearGradient>
            <linearGradient id="wickerWeaveV2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#D4AB68" />
              <stop offset="50%" stopColor="#8C6228" />
              <stop offset="100%" stopColor="#C49B58" />
            </linearGradient>
            <linearGradient id="baguetteGradV2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E2A755" />
              <stop offset="50%" stopColor="#C68532" />
              <stop offset="100%" stopColor="#8A5116" />
            </linearGradient>
            <linearGradient id="milkGradV2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#F1EFEA" />
              <stop offset="100%" stopColor="#D6D1C4" />
            </linearGradient>
            <linearGradient id="appleGradV2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="60%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#7F1D1D" />
            </linearGradient>
          </defs>

          {/* Cast Shadow under Basket */}
          <ellipse cx="390" cy="580" rx="320" ry="45" fill="rgba(80, 65, 45, 0.28)" filter="blur(16px)" />

          {/* GROCERY CONTENTS (Behind Front Wicker Wall) */}
          <g transform="translate(0, -20)">
            {/* Artisanal Bread / Baguette tilting left */}
            <path
              d="M 230 400 L 150 160 C 145 140 170 125 190 135 L 270 380 Z"
              fill="url(#baguetteGradV2)"
              stroke="#683A09"
              strokeWidth="2.5"
            />
            {/* Baguette crust cuts */}
            <line x1="168" y1="180" x2="188" y2="195" stroke="#FFE3B8" strokeWidth="4" strokeLinecap="round" />
            <line x1="185" y1="230" x2="208" y2="248" stroke="#FFE3B8" strokeWidth="4" strokeLinecap="round" />
            <line x1="205" y1="280" x2="230" y2="300" stroke="#FFE3B8" strokeWidth="4" strokeLinecap="round" />

            {/* Farm Milk Bottle */}
            <rect x="290" y="180" width="110" height="230" rx="18" fill="url(#milkGradV2)" stroke="#BBB4A2" strokeWidth="2" />
            <rect x="320" y="145" width="50" height="40" rx="6" fill="#3B82F6" />
            <rect x="300" y="240" width="90" height="80" rx="6" fill="#EBF4FF" />
            <text x="345" y="285" fill="#1E40AF" fontSize="22" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
              MILK
            </text>

            {/* Cereal / Grain Carton */}
            <rect x="420" y="160" width="130" height="250" rx="12" fill="#EAB308" stroke="#A16207" strokeWidth="2" />
            <rect x="435" y="190" width="100" height="70" rx="6" fill="#FEF08A" />
            <text x="485" y="235" fill="#854D0E" fontSize="20" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
              OATS
            </text>

            {/* Fresh Red Apples */}
            <circle cx="280" cy="400" r="48" fill="url(#appleGradV2)" stroke="#991B1B" strokeWidth="2" />
            <path d="M 280 355 Q 288 340 300 345" fill="none" stroke="#451A03" strokeWidth="4" strokeLinecap="round" />
            <path d="M 300 345 Q 315 340 310 355 Z" fill="#22C55E" />

            <circle cx="360" cy="410" r="44" fill="url(#appleGradV2)" stroke="#991B1B" strokeWidth="2" />
            <path d="M 360 368 Q 368 355 378 360" fill="none" stroke="#451A03" strokeWidth="3.5" strokeLinecap="round" />

            {/* Egg Carton */}
            <rect x="480" y="360" width="160" height="85" rx="14" fill="#D6CDB8" stroke="#8A7E65" strokeWidth="2.5" />
            <text x="560" y="412" fill="#574E38" fontSize="20" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
              EGGS
            </text>
          </g>

          {/* WICKER BASKET BODY */}
          {/* Main Trapezoid Tub */}
          <path
            d="M 140 350 L 210 560 C 215 575 230 585 250 585 L 530 585 C 550 585 565 575 570 560 L 640 350 Z"
            fill="url(#basketGradV2)"
            stroke="#593D15"
            strokeWidth="5"
          />

          {/* Wicker Ribs & Weave Lines */}
          <path d="M 180 355 L 240 580" stroke="url(#wickerWeaveV2)" strokeWidth="8" strokeLinecap="round" />
          <path d="M 240 355 L 285 580" stroke="url(#wickerWeaveV2)" strokeWidth="8" strokeLinecap="round" />
          <path d="M 310 355 L 340 580" stroke="url(#wickerWeaveV2)" strokeWidth="8" strokeLinecap="round" />
          <path d="M 390 355 L 390 580" stroke="url(#wickerWeaveV2)" strokeWidth="8" strokeLinecap="round" />
          <path d="M 470 355 L 440 580" stroke="url(#wickerWeaveV2)" strokeWidth="8" strokeLinecap="round" />
          <path d="M 540 355 L 495 580" stroke="url(#wickerWeaveV2)" strokeWidth="8" strokeLinecap="round" />
          <path d="M 600 355 L 540 580" stroke="url(#wickerWeaveV2)" strokeWidth="8" strokeLinecap="round" />

          {/* Horizontal weave bands */}
          <path d="M 160 410 Q 390 435 620 410" fill="none" stroke="#5E4018" strokeWidth="6" />
          <path d="M 180 470 Q 390 495 600 470" fill="none" stroke="#5E4018" strokeWidth="6" />
          <path d="M 200 530 Q 390 550 580 530" fill="none" stroke="#5E4018" strokeWidth="6" />

          {/* Thick Braided Basket Rim */}
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

        {/* Clear 1-to-1 Relationship Pill */}
        <div
          style={{
            marginTop: 40,
            padding: '18px 46px',
            borderRadius: 50,
            background: 'linear-gradient(135deg, #FAF8F2 0%, #E8E2D2 100%)',
            border: '3px solid #8F8772',
            boxShadow: '0 20px 40px rgba(70, 55, 35, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <span style={{ fontSize: 38, fontWeight: 900, color: '#1B1914', fontFamily: 'serif' }}>$100</span>
          <span style={{ fontSize: 32, color: '#8F8772' }}>➔</span>
          <span style={{ fontSize: 30, fontWeight: 800, color: '#10B981', letterSpacing: 1.5 }}>
            100% OF THIS BASKET
          </span>
        </div>
      </div>
    </div>
  );
};
