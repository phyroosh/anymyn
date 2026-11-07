import React from 'react';
import { THEME } from '../theme';

export interface BanknotePropProps {
  scale?: number;
  panY?: number;
  rotateX?: number;
  rotateY?: number;
  sheenProgress?: number;
  flareIntensity?: number;
}

export const BanknoteProp: React.FC<BanknotePropProps> = ({
  scale = 1.0,
  panY = 0,
  rotateX = 14,
  rotateY = -6,
  sheenProgress = -180,
  flareIntensity = 0,
}) => {
  return (
    <div
      style={{
        perspective: 1200,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          transform: `scale(${scale}) translateY(${panY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.05s ease-out',
        }}
      >
        <div
          style={{
            width: 780,
            height: 430,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #E6E2D3 0%, #D8D2BF 45%, #C9C2AC 100%)',
            border: '4px solid #8F8772',
            boxShadow: `
              0 35px 70px -15px rgba(50, 42, 25, 0.35),
              0 15px 30px -8px rgba(0, 0, 0, 0.15),
              inset 0 2px 4px rgba(255, 255, 255, 0.6)
            `,
            position: 'relative',
            overflow: 'hidden',
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Guilloché Engraving Pattern */}
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: 0.35,
              pointerEvents: 'none',
            }}
            viewBox="0 0 780 430"
          >
            <defs>
              <pattern id="guillocheV5" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="18" fill="none" stroke="#5C5542" strokeWidth="0.8" />
                <circle cx="20" cy="20" r="12" fill="none" stroke="#5C5542" strokeWidth="0.6" strokeDasharray="2 2" />
                <path d="M0,20 Q10,0 20,20 T40,20" fill="none" stroke="#5C5542" strokeWidth="0.7" />
                <path d="M20,0 Q0,10 20,20 T20,40" fill="none" stroke="#5C5542" strokeWidth="0.7" />
              </pattern>
            </defs>
            <rect width="780" height="430" fill="url(#guillocheV5)" />
            <rect x="16" y="16" width="748" height="398" fill="none" stroke="#484232" strokeWidth="2.5" />
            <rect x="22" y="22" width="736" height="386" fill="none" stroke="#484232" strokeWidth="1" strokeDasharray="4 4" />
          </svg>

          {/* Holographic Security Ribbon */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 245,
              width: 48,
              background: 'linear-gradient(180deg, #1C4ED8 0%, #06B6D4 30%, #10B981 70%, #6366F1 100%)',
              opacity: 0.85,
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              alignItems: 'center',
              zIndex: 4,
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 900, color: '#FFFFFF', transform: 'rotate(-90deg)', letterSpacing: 2 }}>100</span>
            <span style={{ fontSize: 16, fontWeight: 900, color: '#FFFFFF', transform: 'rotate(-90deg)', letterSpacing: 2 }}>USA</span>
            <span style={{ fontSize: 16, fontWeight: 900, color: '#FFFFFF', transform: 'rotate(-90deg)', letterSpacing: 2 }}>100</span>
          </div>

          {/* Note Header */}
          <div style={{ position: 'relative', zIndex: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#363226', letterSpacing: 3 }}>FEDERAL RESERVE NOTE</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#1F1C15', letterSpacing: 4, marginTop: 4 }}>THE UNITED STATES OF AMERICA</div>
            </div>
            <div style={{ fontSize: 64, fontWeight: 900, color: '#1F1C15', lineHeight: 0.85, fontFamily: 'serif' }}>
              $100
            </div>
          </div>

          {/* Center Vignette & Oval Seal */}
          <div style={{ position: 'relative', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                width: 220,
                height: 145,
                borderRadius: '50%',
                border: '3px solid #574F3B',
                background: 'radial-gradient(circle, #DFDAC9 0%, #C7C0AB 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.18)',
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: '#453E2E', letterSpacing: 2 }}>MONETARY ASSET</div>
              <div style={{ fontSize: 46, fontWeight: 900, color: '#1F1C15', letterSpacing: 1 }}>$100</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#574F3B', letterSpacing: 3, marginTop: 2 }}>LEGAL TENDER</div>
            </div>
          </div>

          {/* Note Footer */}
          <div style={{ position: 'relative', zIndex: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#484232', letterSpacing: 2 }}>
              SERIES 2026 • NOMINAL CURRENCY
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1F1C15', letterSpacing: 2 }}>
              ONE HUNDRED DOLLARS
            </div>
          </div>

          {/* Rolling Specular Highlight Bar */}
          <div
            style={{
              position: 'absolute',
              top: -100,
              bottom: -100,
              width: 90,
              background:
                'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,245,215,0.75) 50%, rgba(255,255,255,0) 100%)',
              transform: `translateX(${sheenProgress}%) rotate(25deg)`,
              filter: 'blur(8px)',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />

          {/* Caustic Starburst Glint */}
          {flareIntensity > 0.05 && (
            <div
              style={{
                position: 'absolute',
                top: 28,
                right: 48,
                zIndex: 25,
                pointerEvents: 'none',
                opacity: flareIntensity,
                transform: `scale(${flareIntensity})`,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: 70,
                  height: 6,
                  background: '#FFFFFF',
                  borderRadius: 3,
                  boxShadow: '0 0 16px #FFF5D0, 0 0 30px #FFD700',
                  transform: 'translate(-35px, -3px)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  width: 6,
                  height: 70,
                  background: '#FFFFFF',
                  borderRadius: 3,
                  boxShadow: '0 0 16px #FFF5D0, 0 0 30px #FFD700',
                  transform: 'translate(-3px, -35px)',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
