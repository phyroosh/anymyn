import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene1MuseumOpening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const introSpring = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 70, mass: 1.1 },
  });

  // Slow, cinematic macro camera push-in
  const cameraScale = interpolate(frame, [0, 255], [0.94, 1.05], {
    extrapolateRight: 'clamp',
  });
  const cameraPanY = interpolate(frame, [0, 255], [15, -15], {
    extrapolateRight: 'clamp',
  });

  // Rolling specular light sweep across the bullion face (t = 0.5s to 3.0s / frames 15 to 90)
  const sheenProgress = interpolate(frame, [15, 95], [-120, 220], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Sharp caustic starburst rim flare at t = 2.0s (frame 60)
  const flareIntensity = interpolate(
    frame,
    [52, 60, 78],
    [0, 1.0, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Fade out transition at the end of scene (frames 235 to 255)
  const sceneOpacity = interpolate(frame, [235, 255], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Subtitle / Question reveal
  const textFade = interpolate(frame, [20, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const textY = interpolate(frame, [20, 50], [25, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Milled edge ticks (72 teeth)
  const numTicks = 72;
  const ticks = Array.from({ length: numTicks }).map((_, i) => {
    const angle = (i * 360) / numTicks;
    return (
      <line
        key={i}
        x1="260"
        y1="16"
        x2="260"
        y2="28"
        stroke="#8A6B29"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.8"
        transform={`rotate(${angle} 260 260)`}
      />
    );
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
      {/* Architectural Limestone & Morning Light Gradients */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(1100px circle at 42% 38%, rgba(255, 255, 255, 0.95) 0%, rgba(245, 240, 230, 0.85) 50%, rgba(232, 224, 210, 0.75) 100%)',
        }}
      />

      {/* Subtle architectural grid coordinates */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: 1080,
          height: 1920,
          opacity: 0.18,
          pointerEvents: 'none',
        }}
      >
        <defs>
          <pattern id="archGrid" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#685536" strokeWidth="0.8" strokeDasharray="3,6" />
          </pattern>
        </defs>
        <rect width="1080" height="1920" fill="url(#archGrid)" />
      </svg>

      {/* Camera Stage */}
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${cameraScale}) translateY(${cameraPanY}px)`,
          transformOrigin: '50% 48%',
          position: 'relative',
        }}
      >
        {/* Monograph Editorial Masthead */}
        <div
          style={{
            position: 'absolute',
            top: 180,
            left: 90,
            right: 90,
            opacity: textFade,
            transform: `translateY(${textY}px)`,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(138, 107, 41, 0.35)',
              paddingBottom: 16,
            }}
          >
            <span
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 4.5,
                color: '#8A6B29',
                textTransform: 'uppercase',
              }}
            >
              ANYMYN EDITORIAL • MONOGRAPH NO. 01
            </span>
            <span
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: 2.5,
                color: '#655740',
              }}
            >
              FIG. 01 / CAPITAL SEED
            </span>
          </div>

          <h1
            style={{
              margin: '22px 0 0 0',
              fontSize: 56,
              fontWeight: 400,
              lineHeight: 1.18,
              color: '#1B1712',
              letterSpacing: -0.5,
            }}
          >
            What if your money
            <br />
            <span
              style={{
                fontStyle: 'italic',
                fontWeight: 600,
                color: '#8A6B29',
                textShadow: '0 2px 20px rgba(138, 107, 41, 0.25)',
              }}
            >
              could earn money?
            </span>
          </h1>

          <p
            style={{
              margin: '12px 0 0 0',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: 21,
              fontWeight: 400,
              color: '#5E5442',
              letterSpacing: 0.2,
              lineHeight: 1.45,
            }}
          >
            Not just once—but continuously, until returns begin generating their own returns.
          </p>
        </div>

        {/* Central Minted Bullion Medallion ($10,000) */}
        <div
          style={{
            position: 'absolute',
            top: 720,
            left: 280,
            width: 520,
            height: 520,
            transform: `scale(${introSpring})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Deep Ambient Occlusion Drop Shadow */}
          <div
            style={{
              position: 'absolute',
              top: 55,
              left: 35,
              width: 450,
              height: 450,
              borderRadius: '50%',
              backgroundColor: 'rgba(50, 38, 20, 0.22)',
              filter: 'blur(45px)',
              transform: 'scale(1.08, 0.82)',
            }}
          />
          {/* Secondary Soft Rim Shadow */}
          <div
            style={{
              position: 'absolute',
              top: 35,
              left: 20,
              width: 480,
              height: 480,
              borderRadius: '50%',
              backgroundColor: 'rgba(120, 95, 45, 0.15)',
              filter: 'blur(25px)',
            }}
          />

          {/* SVG Medallion Construction */}
          <svg
            width="520"
            height="520"
            viewBox="0 0 520 520"
            style={{
              position: 'relative',
              filter: 'drop-shadow(0 15px 35px rgba(80, 60, 25, 0.28))',
            }}
          >
            <defs>
              {/* Gold outer rim bevel gradient */}
              <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF1BE" />
                <stop offset="25%" stopColor="#E3B755" />
                <stop offset="50%" stopColor="#B6872D" />
                <stop offset="75%" stopColor="#F5D77F" />
                <stop offset="100%" stopColor="#6C4B13" />
              </linearGradient>

              {/* Inner Bullion Face Radial Gradient */}
              <radialGradient id="faceGrad" cx="38%" cy="32%" r="68%">
                <stop offset="0%" stopColor="#FFF9E0" />
                <stop offset="28%" stopColor="#F0CE74" />
                <stop offset="65%" stopColor="#C49635" />
                <stop offset="92%" stopColor="#875E19" />
                <stop offset="100%" stopColor="#54370A" />
              </radialGradient>

              {/* Rolling Specular Sheen Gradient */}
              <linearGradient id="sheenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
                <stop offset="45%" stopColor="rgba(255, 255, 255, 0.1)" />
                <stop offset="50%" stopColor="rgba(255, 255, 255, 0.75)" />
                <stop offset="55%" stopColor="rgba(255, 255, 255, 0.1)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
              </linearGradient>

              {/* Clip path for the coin face */}
              <clipPath id="coinClip">
                <circle cx="260" cy="260" r="236" />
              </clipPath>
            </defs>

            {/* Base Outermost Rim */}
            <circle cx="260" cy="260" r="255" fill="url(#rimGrad)" />
            <circle cx="260" cy="260" r="250" fill="#845D1C" />

            {/* Milled Teeth ticks */}
            {ticks}

            {/* Outer Inset Ring */}
            <circle cx="260" cy="260" r="236" fill="url(#faceGrad)" stroke="#5A3D0F" strokeWidth="2.5" />

            {/* Guilloché Engine Engraving Lines */}
            <g opacity="0.32" stroke="#684714" strokeWidth="0.8" fill="none">
              <circle cx="260" cy="260" r="218" strokeDasharray="4,8" />
              <circle cx="260" cy="260" r="198" strokeDasharray="2,6" />
              <circle cx="260" cy="260" r="178" />
              <circle cx="260" cy="260" r="158" strokeDasharray="3,5" />
              <circle cx="260" cy="260" r="138" />
              <circle cx="260" cy="260" r="118" strokeDasharray="4,6" />
            </g>

            {/* Mint Typography Circular Path */}
            <path
              id="coinTextPathTop"
              d="M 68 260 A 192 192 0 0 1 452 260"
              fill="none"
            />
            <path
              id="coinTextPathBottom"
              d="M 452 260 A 192 192 0 0 1 68 260"
              fill="none"
            />

            <text
              fill="#523910"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="12.5"
              fontWeight="700"
              letterSpacing="3.5"
              opacity="0.9"
            >
              <textPath href="#coinTextPathTop" startOffset="50%" textAnchor="middle">
                ANYMYN MONETARY RESERVE • INITIAL PRINCIPAL
              </textPath>
            </text>

            <text
              fill="#523910"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="12.5"
              fontWeight="700"
              letterSpacing="3.5"
              opacity="0.9"
            >
              <textPath href="#coinTextPathBottom" startOffset="50%" textAnchor="middle">
                FINE GOLD 999.9 • COMPOUND HORIZON
              </textPath>
            </text>

            {/* Center Core Seal */}
            <circle cx="260" cy="260" r="105" fill="#C99B37" stroke="#6C4A15" strokeWidth="3" />
            <circle cx="260" cy="260" r="98" fill="none" stroke="#FCE69B" strokeWidth="1.5" />

            {/* Central Denomination: $10,000 */}
            <text
              x="260"
              y="245"
              textAnchor="middle"
              fill="#3A2708"
              fontFamily='"Cinzel", "Playfair Display", Georgia, serif'
              fontSize="48"
              fontWeight="700"
              letterSpacing="-0.5"
            >
              $10,000
            </text>
            <text
              x="260"
              y="285"
              textAnchor="middle"
              fill="#6A4914"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="15"
              fontWeight="700"
              letterSpacing="3.5"
            >
              CAPITAL SEED
            </text>

            {/* Rolling Specular Light Sheen Overlay */}
            <g clipPath="url(#coinClip)">
              <rect
                x={sheenProgress}
                y="0"
                width="280"
                height="520"
                fill="url(#sheenGrad)"
                transform="rotate(25 260 260)"
              />
            </g>
          </svg>

          {/* Caustic Starburst Glint (t = 2.0s / frame 60) */}
          {flareIntensity > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 38,
                left: 105,
                width: 140,
                height: 140,
                transform: 'translate(-50%, -50%)',
                opacity: flareIntensity,
                pointerEvents: 'none',
              }}
            >
              {/* Central Core Glow */}
              <div
                style={{
                  position: 'absolute',
                  inset: 35,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #FFFFFF 0%, rgba(255, 240, 180, 0.9) 40%, rgba(255, 215, 100, 0) 70%)',
                  filter: 'blur(3px)',
                }}
              />
              {/* Starburst Cross Rays */}
              <div
                style={{
                  position: 'absolute',
                  top: '48%',
                  left: 0,
                  right: 0,
                  height: 3,
                  background: 'linear-gradient(90deg, transparent, #FFFFFF, transparent)',
                  transform: 'rotate(0deg)',
                  boxShadow: '0 0 15px #FFE699',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: '48%',
                  width: 3,
                  background: 'linear-gradient(180deg, transparent, #FFFFFF, transparent)',
                  boxShadow: '0 0 15px #FFE699',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '48%',
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'linear-gradient(90deg, transparent, #FFF4D0, transparent)',
                  transform: 'rotate(45deg)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '48%',
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'linear-gradient(90deg, transparent, #FFF4D0, transparent)',
                  transform: 'rotate(-45deg)',
                }}
              />
            </div>
          )}
        </div>

        {/* Lower Editorial Footnote / Baseline parameter */}
        <div
          style={{
            position: 'absolute',
            bottom: 220,
            left: 90,
            right: 90,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            opacity: textFade,
            borderTop: '1px solid rgba(138, 107, 41, 0.25)',
            paddingTop: 18,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 2,
                color: '#8A6B29',
                textTransform: 'uppercase',
              }}
            >
              INITIAL VALUATION
            </span>
            <span
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 22,
                fontWeight: 700,
                color: '#241D14',
              }}
            >
              $10,000.00 USD
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
            <span
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 2,
                color: '#8A6B29',
                textTransform: 'uppercase',
              }}
            >
              MODEL HORIZON
            </span>
            <span
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 22,
                fontWeight: 700,
                color: '#241D14',
              }}
            >
              30 YEARS • 10% APY
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
