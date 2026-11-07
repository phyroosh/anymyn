import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Shot1TheMoneyV2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const introSpring = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 70, mass: 1.1 },
  });

  // Slow, cinematic macro camera push-in
  const cameraScale = interpolate(frame, [0, 240], [0.95, 1.05], {
    extrapolateRight: 'clamp',
  });
  const cameraPanY = interpolate(frame, [0, 240], [15, -10], {
    extrapolateRight: 'clamp',
  });
  const cameraRotateX = interpolate(frame, [0, 240], [16, 9], {
    extrapolateRight: 'clamp',
  });
  const cameraRotateY = interpolate(frame, [0, 240], [-10, -3], {
    extrapolateRight: 'clamp',
  });

  // Rolling specular light sweep across banknote face (frames 20 to 90)
  const sheenProgress = interpolate(frame, [20, 90], [-180, 260], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Caustic starburst rim flare at t = 2.0s (frame 60)
  const flareIntensity = interpolate(
    frame,
    [52, 60, 78],
    [0, 1.0, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Fade out transition at the end of scene (frames 220 to 240)
  const sceneOpacity = interpolate(frame, [220, 240], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Hero typography entrance
  const titleSpring = spring({
    frame: frame - 12,
    fps,
    config: { damping: 16, stiffness: 90 },
  });

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: '#FAF8F2',
        position: 'relative',
        overflow: 'hidden',
        opacity: sceneOpacity,
        fontFamily: '"Cinzel", "Playfair Display", "Times New Roman", serif',
      }}
    >
      {/* Architectural Warm Gallery Lighting */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(1100px circle at 46% 36%, rgba(255, 255, 255, 0.98) 0%, rgba(246, 241, 232, 0.90) 50%, rgba(230, 222, 208, 0.85) 100%)',
        }}
      />

      {/* Atmospheric directional shadow */}
      <div
        style={{
          position: 'absolute',
          top: 640,
          left: 140,
          width: 800,
          height: 500,
          background: 'radial-gradient(ellipse at center, rgba(160, 140, 115, 0.28) 0%, rgba(250, 248, 242, 0) 70%)',
          filter: 'blur(35px)',
          transform: 'rotate(-6deg) scaleY(0.65)',
        }}
      />

      {/* Monumental Hero Headline — ONE SHOT. ONE IDEA. */}
      <div
        style={{
          position: 'absolute',
          top: 260,
          left: 80,
          right: 80,
          zIndex: 30,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 1.08,
            color: '#121316',
            letterSpacing: -1.5,
            opacity: titleSpring,
            transform: `translateY(${(1 - titleSpring) * 35}px)`,
            textTransform: 'uppercase',
          }}
        >
          This Is $100.
        </div>
      </div>

      {/* Banknote 3D Stage */}
      <div
        style={{
          position: 'absolute',
          top: 720,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          perspective: 1200,
          zIndex: 20,
        }}
      >
        <div
          style={{
            transform: `scale(${introSpring * cameraScale}) translateY(${cameraPanY}px) rotateX(${cameraRotateX}deg) rotateY(${cameraRotateY}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.05s ease-out',
          }}
        >
          {/* Banknote Object */}
          <div
            style={{
              width: 780,
              height: 430,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #E6E2D3 0%, #D8D2BF 45%, #C9C2AC 100%)',
              border: '4px solid #8F8772',
              boxShadow: `
                0 35px 70px -15px rgba(50, 42, 25, 0.40),
                0 15px 30px -8px rgba(0, 0, 0, 0.20),
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
            {/* Guilloché Geometric Background Engraving Pattern */}
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
                <pattern id="guillocheV2" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="18" fill="none" stroke="#5C5542" strokeWidth="0.8" />
                  <circle cx="20" cy="20" r="12" fill="none" stroke="#5C5542" strokeWidth="0.6" strokeDasharray="2 2" />
                  <path d="M0,20 Q10,0 20,20 T40,20" fill="none" stroke="#5C5542" strokeWidth="0.7" />
                  <path d="M20,0 Q0,10 20,20 T20,40" fill="none" stroke="#5C5542" strokeWidth="0.7" />
                </pattern>
              </defs>
              <rect width="780" height="430" fill="url(#guillocheV2)" />
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

            {/* Rolling Specular Light Highlight Bar */}
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
                <div
                  style={{
                    position: 'absolute',
                    width: 44,
                    height: 4,
                    background: '#FFEAA7',
                    borderRadius: 2,
                    transform: 'translate(-22px, -2px) rotate(45deg)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    width: 4,
                    height: 44,
                    background: '#FFEAA7',
                    borderRadius: 2,
                    transform: 'translate(-2px, -22px) rotate(45deg)',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
