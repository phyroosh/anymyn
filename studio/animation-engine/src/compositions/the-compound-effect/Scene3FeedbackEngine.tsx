import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene3FeedbackEngine: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene transition fades
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [395, 420], [1, 0], { extrapolateLeft: 'clamp' });

  // Camera slow cinematic push
  const cameraScale = interpolate(frame, [0, 420], [0.95, 1.05], { extrapolateRight: 'clamp' });

  // --- CYCLE 01 (t = 2.0s – 5.5s / frames 60 – 165) ---
  // Return token 1 ($1,000) mints, orbits, and docks
  const c1MintProgress = interpolate(frame, [60, 95], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const c1OrbitProgress = interpolate(frame, [90, 150], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Elliptical arc coordinates
  const c1Angle = c1OrbitProgress * Math.PI; // 0 to 180 deg
  const c1X = Math.cos(c1Angle - Math.PI / 2) * 260;
  const c1Y = -Math.sin(c1Angle - Math.PI / 2) * 160 - 80;

  // Docking impact 1 at frame 150
  const c1DockImpact = spring({
    frame: frame - 150,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });
  const shockwave1 = interpolate(frame, [150, 185], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Base expansion 1 ($10k -> $11k)
  const baseScale1 = interpolate(c1DockImpact, [0, 1], [1.0, 1.12]);
  const baseValue1 = interpolate(frame, [150, 165], [10000, 11000], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // --- CYCLE 02 (t = 6.0s – 10.0s / frames 180 – 300) ---
  // Return token 2 ($1,100) mints, orbits, and docks
  const c2MintProgress = interpolate(frame, [180, 215], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const c2OrbitProgress = interpolate(frame, [210, 270], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const c2Angle = c2OrbitProgress * Math.PI;
  const c2X = -Math.cos(c2Angle - Math.PI / 2) * 290;
  const c2Y = -Math.sin(c2Angle - Math.PI / 2) * 180 - 90;

  // Docking impact 2 at frame 270
  const c2DockImpact = spring({
    frame: frame - 270,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });
  const shockwave2 = interpolate(frame, [270, 305], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Base expansion 2 ($11k -> $12.1k)
  const baseScale2 = interpolate(c2DockImpact, [0, 1], [1.12, 1.25]);
  const baseValue2 = interpolate(frame, [270, 285], [11000, 12100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const currentBaseValue = frame < 150 ? 10000 : frame < 270 ? baseValue1 : baseValue2;
  const currentBaseScale = frame < 150 ? 1.0 : frame < 270 ? baseScale1 : baseScale2;

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: '#120F0C',
        position: 'relative',
        overflow: 'hidden',
        opacity: fadeIn * fadeOut,
        fontFamily: '"Cinzel", "Playfair Display", Georgia, serif',
      }}
    >
      {/* Deep Workshop Atmosphere & Overhead Spotlight */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(900px circle at 50% 46%, rgba(210, 160, 60, 0.16) 0%, rgba(20, 16, 12, 0.95) 70%, #0C0A08 100%)',
        }}
      />

      {/* Industrial geometric ring grid */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: 1080,
          height: 1920,
          opacity: 0.22,
          pointerEvents: 'none',
        }}
      >
        <circle cx="540" cy="980" r="420" fill="none" stroke="#D4AF37" strokeWidth="1" strokeDasharray="4,8" />
        <circle cx="540" cy="980" r="320" fill="none" stroke="#A88426" strokeWidth="1" strokeDasharray="3,6" />
        <circle cx="540" cy="980" r="220" fill="none" stroke="#87651C" strokeWidth="1" />
      </svg>

      {/* Camera Viewport */}
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${cameraScale})`,
          position: 'relative',
        }}
      >
        {/* Header Block */}
        <div
          style={{
            position: 'absolute',
            top: 180,
            left: 90,
            right: 90,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
              paddingBottom: 14,
            }}
          >
            <span
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 4,
                color: '#D4AF37',
                textTransform: 'uppercase',
              }}
            >
              ANYMYN EDITORIAL • CHAPTER III
            </span>
            <span
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: 2,
                color: '#A0907A',
              }}
            >
              THE FEEDBACK ENGINE
            </span>
          </div>

          <h2
            style={{
              margin: '22px 0 0 0',
              fontSize: 52,
              fontWeight: 400,
              lineHeight: 1.15,
              color: '#FBF9F5',
            }}
          >
            Output Becomes Input.
            <br />
            <span style={{ fontStyle: 'italic', fontWeight: 600, color: '#E5C058' }}>
              Returns become capital.
            </span>
          </h2>

          <p
            style={{
              margin: '12px 0 0 0',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: 20,
              color: '#BDB29F',
              lineHeight: 1.45,
            }}
          >
            In year one, ten percent produces $1,000. Reinvested, the working base becomes $11,000—generating $1,100 the very next cycle.
          </p>
        </div>

        {/* Center Kinetic Workshop & Turntable */}
        <div
          style={{
            position: 'absolute',
            top: 680,
            left: 140,
            width: 800,
            height: 640,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Hydraulic Shockwave Rings */}
          {frame >= 150 && frame < 185 && (
            <div
              style={{
                position: 'absolute',
                width: 380 + shockwave1 * 340,
                height: 220 + shockwave1 * 200,
                borderRadius: '50%',
                border: '3px solid rgba(229, 192, 88, ' + (1 - shockwave1) + ')',
                boxShadow: '0 0 35px rgba(229, 192, 88, 0.4)',
                pointerEvents: 'none',
              }}
            />
          )}

          {frame >= 270 && frame < 305 && (
            <div
              style={{
                position: 'absolute',
                width: 420 + shockwave2 * 360,
                height: 240 + shockwave2 * 210,
                borderRadius: '50%',
                border: '3px solid rgba(16, 185, 129, ' + (1 - shockwave2) + ')',
                boxShadow: '0 0 40px rgba(16, 185, 129, 0.5)',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Isometric Base Foundation Turntable */}
          <div
            style={{
              position: 'relative',
              width: 440,
              height: 260,
              transform: `scale(${currentBaseScale})`,
              transition: 'transform 0.1s ease-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* 3D Isometric Cylinder Base SVG */}
            <svg width="440" height="260" viewBox="0 0 440 260">
              <defs>
                <linearGradient id="baseMetal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4A3B22" />
                  <stop offset="50%" stopColor="#2D2313" />
                  <stop offset="100%" stopColor="#171209" />
                </linearGradient>

                <linearGradient id="rimGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="50%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>

                <radialGradient id="turntableWell" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#110E0A" />
                  <stop offset="80%" stopColor="#261E14" />
                  <stop offset="100%" stopColor="#423420" />
                </radialGradient>
              </defs>

              {/* Lower cylinder body */}
              <ellipse cx="220" cy="180" rx="190" ry="70" fill="url(#baseMetal)" />
              <rect x="30" y="110" width="380" height="70" fill="url(#baseMetal)" />

              {/* Upper turntable platform */}
              <ellipse cx="220" cy="110" rx="190" ry="70" fill="url(#turntableWell)" stroke="url(#rimGlow)" strokeWidth="3" />
              <ellipse cx="220" cy="110" rx="150" ry="52" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="6,8" />
              <ellipse cx="220" cy="110" rx="90" ry="32" fill="#1C160F" stroke="#FBBF24" strokeWidth="2" />
            </svg>

            {/* Readout label on top of platform */}
            <div
              style={{
                position: 'absolute',
                top: 80,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 3,
                  color: '#D4AF37',
                }}
              >
                CURRENT CAPITAL BASE
              </div>
              <div
                style={{
                  fontFamily: '"Cinzel", Georgia, serif',
                  fontSize: 34,
                  fontWeight: 700,
                  color: '#FFF8E7',
                  textShadow: '0 2px 10px rgba(212, 175, 55, 0.4)',
                }}
              >
                ${Math.round(currentBaseValue).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Cycle 01 Return Disc ($1,000) traveling orbital trajectory */}
          {frame >= 60 && frame < 150 && (
            <div
              style={{
                position: 'absolute',
                transform: `translate(${c1X}px, ${c1Y}px) scale(${c1MintProgress})`,
                width: 140,
                height: 60,
                borderRadius: 30,
                background: 'linear-gradient(135deg, #FFFBEB 0%, #F59E0B 50%, #B45309 100%)',
                boxShadow: '0 10px 25px rgba(245, 158, 11, 0.45), 0 0 15px #FDE68A',
                border: '2px solid #FFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 800, color: '#3E2405', fontFamily: 'system-ui' }}>
                +$1,000
              </span>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: '#78350F', letterSpacing: 1.5 }}>
                YR 1 RETURN (10%)
              </span>
            </div>
          )}

          {/* Cycle 02 Return Disc ($1,100) traveling orbital trajectory */}
          {frame >= 180 && frame < 270 && (
            <div
              style={{
                position: 'absolute',
                transform: `translate(${c2X}px, ${c2Y}px) scale(${c2MintProgress})`,
                width: 154,
                height: 66,
                borderRadius: 33,
                background: 'linear-gradient(135deg, #ECFDF5 0%, #10B981 50%, #047857 100%)',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.5), 0 0 20px #A7F3D0',
                border: '2px solid #FFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20,
              }}
            >
              <span style={{ fontSize: 17, fontWeight: 800, color: '#064E3B', fontFamily: 'system-ui' }}>
                +$1,100
              </span>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: '#065F46', letterSpacing: 1.5 }}>
                YR 2 RETURN (10% OF $11K)
              </span>
            </div>
          )}
        </div>

        {/* Lower Editorial Milestone Banner */}
        <div
          style={{
            position: 'absolute',
            bottom: 220,
            left: 90,
            right: 90,
            backgroundColor: 'rgba(25, 20, 15, 0.85)',
            backdropFilter: 'blur(16px)',
            borderRadius: 18,
            padding: '22px 32px',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 2.5,
                color: '#D4AF37',
              }}
            >
              THE SELF-REINFORCING LOOP
            </div>
            <div
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 26,
                fontWeight: 700,
                color: '#FAF6EE',
                marginTop: 4,
              }}
            >
              Every return expands future yield.
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2,
                color: '#9CA3AF',
              }}
            >
              MECHANISM
            </div>
            <div
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 22,
                fontWeight: 800,
                color: '#10B981',
              }}
            >
              COMPOUNDING
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
