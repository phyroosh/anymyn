import React from 'react';
import { THEME } from '../theme';

export interface BalanceScalePropProps {
  beamAngle?: number; // 0 to 12
  rightMassScale?: number; // 1.0 to 1.55
  scale?: number;
}

export const BalanceScaleProp: React.FC<BalanceScalePropProps> = ({
  beamAngle = 0,
  rightMassScale = 1.0,
  scale = 1.0,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      <svg width="960" height="720" viewBox="0 0 960 720" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="brassGradV5" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F5D77F" />
            <stop offset="50%" stopColor="#C49B3B" />
            <stop offset="100%" stopColor="#7A5A18" />
          </linearGradient>
          <linearGradient id="panGradV5" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FAF7F0" />
            <stop offset="70%" stopColor="#E5DFD0" />
            <stop offset="100%" stopColor="#C9BFAB" />
          </linearGradient>
          <linearGradient id="terracottaGradV5" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </linearGradient>
        </defs>

        {/* Ambient Shadow under Base */}
        <ellipse cx="480" cy="685" rx="180" ry="22" fill={THEME.colors.shadowContact} filter="blur(14px)" />

        {/* Central Pedestal / Base Pillar */}
        <rect x="465" y="320" width="30" height="340" rx="6" fill="url(#brassGradV5)" stroke="#543D0F" strokeWidth="3" />
        <polygon points="430,660 530,660 500,640 460,640" fill="url(#brassGradV5)" />
        <rect x="380" y="660" width="200" height="30" rx="8" fill="url(#brassGradV5)" stroke="#543D0F" strokeWidth="3" />

        {/* Center Fulcrum Pin */}
        <circle cx="480" cy="320" r="26" fill="#FDE68A" stroke="#543D0F" strokeWidth="4" />
        <circle cx="480" cy="320" r="10" fill="#78350F" />

        {/* Pivoting Scale Beam */}
        <g transform={`rotate(${beamAngle}, 480, 320)`}>
          {/* Main Beam */}
          <rect x="80" y="312" width="800" height="16" rx="8" fill="url(#brassGradV5)" stroke="#543D0F" strokeWidth="2.5" />
          <circle cx="120" cy="320" r="14" fill="#FDE68A" stroke="#543D0F" strokeWidth="3" />
          <circle cx="840" cy="320" r="14" fill="#FDE68A" stroke="#543D0F" strokeWidth="3" />

          {/* LEFT PAN SUSPENSION (Unchanged Banknote Side) */}
          <g transform={`rotate(${-beamAngle}, 120, 320)`}>
            <line x1="120" y1="320" x2="80" y2="450" stroke="#8A6E2B" strokeWidth="3" />
            <line x1="120" y1="320" x2="160" y2="450" stroke="#8A6E2B" strokeWidth="3" />
            
            {/* Left Weighing Pan */}
            <ellipse cx="120" cy="455" rx="100" ry="24" fill="url(#panGradV5)" stroke="#685E4D" strokeWidth="2.5" />

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
              <rect x="40" y="0" width="10" height="75" fill="#3B82F6" opacity="0.85" />
              <text x="75" y="48" fill="#1F1C15" fontSize="28" fontWeight="900" textAnchor="middle" fontFamily="serif">
                $100
              </text>
            </g>
            <text x="120" y="515" fill="#756A5B" fontSize="22" fontWeight="800" textAnchor="middle" letterSpacing="2">
              UNCHANGED
            </text>
          </g>

          {/* RIGHT PAN SUSPENSION (Rising Price Mass Side) */}
          <g transform={`rotate(${-beamAngle}, 840, 320)`}>
            <line x1="840" y1="320" x2="800" y2="450" stroke="#8A6E2B" strokeWidth="3" />
            <line x1="840" y1="320" x2="880" y2="450" stroke="#8A6E2B" strokeWidth="3" />
            
            {/* Right Weighing Pan */}
            <ellipse cx="840" cy="455" rx="100" ry="24" fill="url(#panGradV5)" stroke="#685E4D" strokeWidth="2.5" />

            {/* EXPANDING PRICE MASS ON RIGHT PAN */}
            <g transform={`translate(840, 440) scale(${rightMassScale}) translate(-50, -60)`}>
              <rect
                x="0"
                y="0"
                width="100"
                height="60"
                rx="8"
                fill="url(#terracottaGradV5)"
                stroke="#541616"
                strokeWidth="2.5"
              />
              <text x="50" y="38" fill="#FFFFFF" fontSize="22" fontWeight="900" textAnchor="middle">
                PRICES
              </text>
            </g>
            <text x="840" y="515" fill="#9E2A2B" fontSize="22" fontWeight="800" textAnchor="middle" letterSpacing="2">
              RISING (+80.6%)
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};
