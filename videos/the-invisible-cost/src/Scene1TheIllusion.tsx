import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene1TheIllusion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const introSpring = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 70, mass: 1.1 },
  });

  // Slow, cinematic macro camera push-in
  const cameraScale = interpolate(frame, [0, 315], [0.94, 1.06], {
    extrapolateRight: 'clamp',
  });
  const cameraPanY = interpolate(frame, [0, 315], [20, -15], {
    extrapolateRight: 'clamp',
  });
  const cameraRotateX = interpolate(frame, [0, 315], [18, 12], {
    extrapolateRight: 'clamp',
  });
  const cameraRotateY = interpolate(frame, [0, 315], [-12, -4], {
    extrapolateRight: 'clamp',
  });

  // Rolling specular light sweep across banknote face (frames 30 to 110)
  const sheenProgress = interpolate(frame, [30, 110], [-180, 260], {
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

  // Fade out transition at the end of scene (frames 290 to 315)
  const sceneOpacity = interpolate(frame, [290, 315], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Hero typography entrance
  const titleSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  const subtitleFade = interpolate(frame, [35, 65], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
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
          top: 600,
          left: 140,
          width: 800,
          height: 500,
          background: 'radial-gradient(ellipse at center, rgba(160, 140, 115, 0.28) 0%, rgba(250, 248, 242, 0) 70%)',
          filter: 'blur(35px)',
          transform: 'rotate(-6deg) scaleY(0.65)',
        }}
      />

      {/* Hero Motion Typography — NO corner metadata or presentation cards */}
      <div
        style={{
          position: 'absolute',
          top: 220,
          left: 80,
          right: 80,
          zIndex: 30,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            lineHeight: 1.08,
            color: '#121316',
            letterSpacing: -1.5,
            opacity: titleSpring,
            transform: `translateY(${(1 - titleSpring) * 35}px)`,
            textTransform: 'uppercase',
          }}
        >
          Is Your Money
          <br />
          <span style={{ color: '#9E2A2B' }}>Losing Its Power?</span>
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 44,
            fontWeight: 600,
            color: '#706A5F',
            letterSpacing: 4,
            textTransform: 'uppercase',
            opacity: subtitleFade,
          }}
        >
          The Illusion of Static Paper
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
              width: 760,
              height: 420,
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
              viewBox="0 0 760 420"
            >
              <defs>
                <pattern id="guilloche" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="18" fill="none" stroke="#5C5542" strokeWidth="0.8" />
                  <circle cx="20" cy="20" r="12" fill="none" stroke="#5C5542" strokeWidth="0.6" strokeDasharray="2 2" />
                  <path d="M0,20 Q10,0 20,20 T40,20" fill="none" stroke="#5C5542" strokeWidth="0.7" />
                  <path d="M20,0 Q0,10 20,20 T20,40" fill="none" stroke="#5C5542" strokeWidth="0.7" />
                </pattern>
              </defs>
              <rect width="760" height="420" fill="url(#guilloche)" />
              <rect x="16" y="16" width="728" height="388" fill="none" stroke="#484232" strokeWidth="2.5" />
              <rect x="22" y="22" width="716" height="376" fill="none" stroke="#484232" strokeWidth="1" strokeDasharray="4 4" />
            </svg>

            {/* Holographic Security Ribbon */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 240,
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
                  width: 210,
                  height: 140,
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
                <div style={{ fontSize: 44, fontWeight: 900, color: '#1F1C15', letterSpacing: 1 }}>$100</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#574F3B', letterSpacing: 3, marginTop: 2 }}>LEGAL TENDER</div>
              </div>
            </div>

            {/* Note Footer */}
            <div style={{ position: 'relative', zIndex: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#453E2E', letterSpacing: 2 }}>
                SERIES 2026 • NOMINAL CURRENCY
              </div>
              <div style={{ fontSize: 42, fontWeight: 900, color: '#1F1C15', fontFamily: 'serif' }}>
                ONE HUNDRED DOLLARS
              </div>
            </div>

            {/* Rolling Specular Sheen Sweep */}
            <div
              style={{
                position: 'absolute',
                top: -100,
                bottom: -100,
                width: 140,
                left: `${sheenProgress}%`,
                background:
                  'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%)',
                transform: 'rotate(25deg)',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            />

            {/* Caustic Starburst Glint (t = 2.0s / frame 60) */}
            <div
              style={{
                position: 'absolute',
                top: 40,
                right: 50,
                width: 100,
                height: 100,
                pointerEvents: 'none',
                opacity: flareIntensity,
                transform: `scale(${0.5 + flareIntensity * 1.1}) rotate(${frame * 2.5}deg)`,
                zIndex: 15,
              }}
            >
              <svg viewBox="-50 -50 100 100" style={{ width: '100%', height: '100%' }}>
                <circle cx="0" cy="0" r="16" fill="rgba(255, 255, 255, 0.95)" filter="drop-shadow(0 0 10px #FFFFFF)" />
                <path d="M 0 -48 L 0 48 M -48 0 L 48 0" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                <path d="M -30 -30 L 30 30 M -30 30 L 30 -30" stroke="#FFDF73" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Anchor Statement */}
      <div
        style={{
          position: 'absolute',
          bottom: 240,
          left: 80,
          right: 80,
          textAlign: 'center',
          zIndex: 30,
          opacity: subtitleFade,
        }}
      >
        <div
          style={{
            fontSize: 34,
            fontWeight: 700,
            color: '#38342C',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          Nominal Stability Masks Real Decay
        </div>
      </div>
    </div>
  );
};
