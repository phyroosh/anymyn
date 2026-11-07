import React from 'react';
import { THEME } from '../theme';

export interface GroceryBasketPropProps {
  fillPercent?: number; // 0 to 100. 100 = full basket, 55.4 = Shot 5 reduced basket
  scale?: number;
  highlightPriceTag?: string | null;
  tagSwingAngle?: number;
}

export const GroceryBasketProp: React.FC<GroceryBasketPropProps> = ({
  fillPercent = 100,
  scale = 1.0,
  highlightPriceTag = null,
  tagSwingAngle = 0,
}) => {
  // At 55.4% fill, the items representing the missing 44.6% (oats, apples, eggs) are ghosted
  const isReduced = fillPercent < 80;
  const missingOpacity = isReduced ? 0.12 : 1.0;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      <svg width="780" height="640" viewBox="0 0 780 640" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="basketGradV5" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C49B58" />
            <stop offset="50%" stopColor="#A47B3E" />
            <stop offset="100%" stopColor="#755223" />
          </linearGradient>
          <linearGradient id="wickerWeaveV5" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D4AB68" />
            <stop offset="50%" stopColor="#8C6228" />
            <stop offset="100%" stopColor="#C49B58" />
          </linearGradient>
          <linearGradient id="baguetteGradV5" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E2A755" />
            <stop offset="50%" stopColor="#C68532" />
            <stop offset="100%" stopColor="#8A5116" />
          </linearGradient>
          <linearGradient id="milkGradV5" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#F1EFEA" />
            <stop offset="100%" stopColor="#D6D1C4" />
          </linearGradient>
          <linearGradient id="appleGradV5" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="60%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </linearGradient>
        </defs>

        {/* Ambient Contact Shadow under Basket */}
        <ellipse
          cx="390"
          cy="580"
          rx="320"
          ry="45"
          fill={THEME.colors.shadowContact}
          filter="blur(16px)"
        />

        {/* GROCERY CONTENTS */}
        <g transform="translate(0, -20)">
          {/* 1. Artisanal Bread / Baguette (Always present — core staples) */}
          <path
            d="M 230 400 L 150 160 C 145 140 170 125 190 135 L 270 380 Z"
            fill="url(#baguetteGradV5)"
            stroke="#683A09"
            strokeWidth="2.5"
          />
          <line x1="168" y1="180" x2="188" y2="195" stroke="#FFE3B8" strokeWidth="4" strokeLinecap="round" />
          <line x1="185" y1="230" x2="208" y2="248" stroke="#FFE3B8" strokeWidth="4" strokeLinecap="round" />
          <line x1="205" y1="280" x2="230" y2="300" stroke="#FFE3B8" strokeWidth="4" strokeLinecap="round" />

          {/* 2. Farm Milk Bottle (Always present) */}
          <rect x="290" y="180" width="110" height="230" rx="18" fill="url(#milkGradV5)" stroke="#BBB4A2" strokeWidth="2" />
          <rect x="320" y="145" width="50" height="40" rx="6" fill="#3B82F6" />
          <rect x="300" y="240" width="90" height="80" rx="6" fill="#EBF4FF" />
          <text x="345" y="285" fill="#1E40AF" fontSize="22" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
            MILK
          </text>

          {/* 3. Cereal / Grain Carton (Missing/Ghosted in Shot 5 if fillPercent < 80) */}
          <g opacity={missingOpacity}>
            <rect x="420" y="160" width="130" height="250" rx="12" fill="#EAB308" stroke="#A16207" strokeWidth="2" />
            <rect x="435" y="190" width="100" height="70" rx="6" fill="#FEF08A" />
            <text x="485" y="235" fill="#854D0E" fontSize="20" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
              OATS
            </text>
          </g>
          {isReduced && (
            <rect
              x="420"
              y="160"
              width="130"
              height="250"
              rx="12"
              fill="none"
              stroke="#B45309"
              strokeWidth="2.5"
              strokeDasharray="8 8"
              opacity={0.65}
            />
          )}

          {/* 4. Fresh Red Apples (Missing/Ghosted in Shot 5) */}
          <g opacity={missingOpacity}>
            <circle cx="280" cy="400" r="48" fill="url(#appleGradV5)" stroke="#991B1B" strokeWidth="2" />
            <path d="M 280 355 Q 288 340 300 345" fill="none" stroke="#451A03" strokeWidth="4" strokeLinecap="round" />
            <circle cx="360" cy="410" r="44" fill="url(#appleGradV5)" stroke="#991B1B" strokeWidth="2" />
          </g>
          {isReduced && (
            <>
              <circle cx="280" cy="400" r="48" fill="none" stroke="#B45309" strokeWidth="2.5" strokeDasharray="6 6" opacity={0.65} />
              <circle cx="360" cy="410" r="44" fill="none" stroke="#B45309" strokeWidth="2.5" strokeDasharray="6 6" opacity={0.65} />
            </>
          )}

          {/* 5. Egg Carton (Missing/Ghosted in Shot 5) */}
          <g opacity={missingOpacity}>
            <rect x="480" y="360" width="160" height="85" rx="14" fill="#D6CDB8" stroke="#8A7E65" strokeWidth="2.5" />
            <text x="560" y="412" fill="#574E38" fontSize="20" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
              EGGS
            </text>
          </g>
          {isReduced && (
            <rect
              x="480"
              y="360"
              width="160"
              height="85"
              rx="14"
              fill="none"
              stroke="#B45309"
              strokeWidth="2.5"
              strokeDasharray="8 8"
              opacity={0.65}
            />
          )}
        </g>

        {/* WICKER BASKET BODY */}
        <path
          d="M 140 350 L 210 560 C 215 575 230 585 250 585 L 530 585 C 550 585 565 575 570 560 L 640 350 Z"
          fill="url(#basketGradV5)"
          stroke="#593D15"
          strokeWidth="5"
        />

        {/* Wicker Weave Lines */}
        <path d="M 180 355 L 240 580" stroke="url(#wickerWeaveV5)" strokeWidth="8" strokeLinecap="round" />
        <path d="M 240 355 L 285 580" stroke="url(#wickerWeaveV5)" strokeWidth="8" strokeLinecap="round" />
        <path d="M 310 355 L 340 580" stroke="url(#wickerWeaveV5)" strokeWidth="8" strokeLinecap="round" />
        <path d="M 390 355 L 390 580" stroke="url(#wickerWeaveV5)" strokeWidth="8" strokeLinecap="round" />
        <path d="M 470 355 L 440 580" stroke="url(#wickerWeaveV5)" strokeWidth="8" strokeLinecap="round" />
        <path d="M 540 355 L 495 580" stroke="url(#wickerWeaveV5)" strokeWidth="8" strokeLinecap="round" />
        <path d="M 600 355 L 540 580" stroke="url(#wickerWeaveV5)" strokeWidth="8" strokeLinecap="round" />

        <path d="M 160 410 Q 390 435 620 410" fill="none" stroke="#5E4018" strokeWidth="6" />
        <path d="M 180 470 Q 390 495 600 470" fill="none" stroke="#5E4018" strokeWidth="6" />
        <path d="M 200 530 Q 390 550 580 530" fill="none" stroke="#5E4018" strokeWidth="6" />

        {/* Braided Basket Rim */}
        <rect x="120" y="340" width="540" height="24" rx="12" fill="#E2BA72" stroke="#593D15" strokeWidth="4" />

        {/* Braided Handle */}
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

      {/* Optional Physical Price Tag Reveal (for Shot 4) */}
      {highlightPriceTag && (
        <div
          style={{
            marginTop: 24,
            transform: `rotate(${tagSwingAngle}deg)`,
            transformOrigin: 'top center',
          }}
        >
          <div
            style={{
              padding: '22px 54px',
              borderRadius: 22,
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF6EE 50%, #EDE6D6 100%)',
              border: `3px solid ${THEME.colors.accentAmber}`,
              boxShadow: `0 25px 50px ${THEME.colors.shadowContact}, inset 0 2px 4px rgba(255, 255, 255, 0.9)`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: THEME.colors.textSecondary,
                letterSpacing: 4,
                textTransform: 'uppercase',
              }}
            >
              PRICE 20 YEARS LATER
            </div>
            <div
              style={{
                fontSize: 114,
                fontWeight: 900,
                color: THEME.colors.accentAmber,
                fontFamily: 'serif',
                lineHeight: 1.0,
                marginTop: 6,
              }}
            >
              {highlightPriceTag}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
