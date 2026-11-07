import React from 'react';
import { THEME } from '../theme';

export interface MonetaryMedallionPropProps {
  scale?: number;
  opacity?: number;
}

export const MonetaryMedallionProp: React.FC<MonetaryMedallionPropProps> = ({
  scale = 1.0,
  opacity = 1.0,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      {/* Sculptural Monetary Seal Emblem */}
      <div
        style={{
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #FAF7F0 0%, #E8E2D0 60%, #C9BEA7 100%)',
          border: '6px solid #8F8772',
          boxShadow: `
            0 30px 60px ${THEME.colors.shadowContact},
            inset 0 3px 8px rgba(255, 255, 255, 0.9)
          `,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Guilloché concentric rings */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          viewBox="0 0 320 320"
        >
          <circle cx="160" cy="160" r="142" fill="none" stroke="#7A715C" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="160" cy="160" r="126" fill="none" stroke="#7A715C" strokeWidth="2" />
          <circle cx="160" cy="160" r="105" fill="none" stroke="#7A715C" strokeWidth="1" strokeDasharray="4 4" />
        </svg>

        {/* Central Emblem Icon */}
        <div style={{ textAlign: 'center', zIndex: 5 }}>
          <div style={{ fontSize: 72 }}>⚖️</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#2B261D', letterSpacing: 4, marginTop: 8 }}>
            REAL POWER
          </div>
        </div>
      </div>
    </div>
  );
};
