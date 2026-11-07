import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Shot1BullionOpeningV4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cinematic macro camera movement
  const cameraZoom = interpolate(frame, [0, 96], [0.98, 1.12], {
    extrapolateRight: 'clamp',
  });
  const cameraTilt = interpolate(frame, [0, 96], [-1.8, 2.2], {
    extrapolateRight: 'clamp',
  });
  const cameraDriftY = interpolate(frame, [0, 96], [20, -10], {
    extrapolateRight: 'clamp',
  });

  // Entrance spring animations
  const coinEntrance = spring({
    frame,
    fps,
    config: { damping: 12, mass: 1.0, stiffness: 75 },
  });

  const titleEntrance = spring({
    frame: frame - 12,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 85 },
  });

  // Rolling golden specular highlight sweep across coin face
  const shimmerPos = interpolate(frame, [12, 72], [-140, 260], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Caustic rim glint flare at frame 36 (synched to audio crystal chime at t = 1.2s)
  const glintOpacity = interpolate(frame, [32, 38, 46], [0, 1.0, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const glintScale = interpolate(frame, [32, 38, 46], [0.4, 1.4, 0.6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 72 milled edge tick marks for physical bullion coin detail
  const milledTicks = Array.from({ length: 72 }, (_, i) => {
    const angle = (i * 360) / 72;
    return (
      <line
        key={i}
        x1="250"
        y1="10"
        x2="250"
        y2="20"
        stroke="rgba(140, 114, 72, 0.45)"
        strokeWidth="2.5"
        transform={`rotate(${angle} 250 250)`}
      />
    );
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#F8F5EE',
        backgroundImage: `
          radial-gradient(circle at 45% 25%, rgba(255, 255, 255, 0.98) 0%, rgba(248, 245, 238, 0.6) 55%),
          linear-gradient(180deg, #FDFBF7 0%, #EBE4D5 100%)
        `,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '120px 80px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Centerpiece: Hero Macro Bullion Medallion */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${cameraZoom}) translateY(${cameraDriftY}px)`,
          transformOrigin: 'center center',
          position: 'relative',
          marginBottom: 80,
        }}
      >
        {/* Realistic multi-layer cast shadow on ivory table */}
        <div
          style={{
            position: 'absolute',
            width: 540,
            height: 120,
            borderRadius: '50%',
            backgroundColor: 'rgba(28, 25, 23, 0.22)',
            filter: 'blur(36px)',
            bottom: 20,
            transform: `scale(${interpolate(frame, [0, 96], [0.95, 1.06])})`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 440,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'rgba(180, 83, 9, 0.14)',
            filter: 'blur(16px)',
            bottom: 30,
          }}
        />

        {/* Sculptural Bullion Disk */}
        <div
          style={{
            width: 520,
            height: 520,
            borderRadius: '50%',
            position: 'relative',
            opacity: Math.max(0, coinEntrance),
            transform: `rotate(${cameraTilt}deg)`,
            boxShadow: `
              0 40px 80px -16px rgba(28, 25, 23, 0.32),
              0 20px 40px -8px rgba(180, 83, 9, 0.22),
              inset 0 4px 8px rgba(255, 255, 255, 0.98),
              inset 0 -6px 12px rgba(68, 64, 60, 0.48)
            `,
            background: 'linear-gradient(140deg, #FFFDF8 0%, #EAD8B8 45%, #C4B08A 80%, #8C7248 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '8px solid #DFCEAF',
            boxSizing: 'border-box',
          }}
        >
          {/* Milled Edge SVG Overlay */}
          <svg
            viewBox="0 0 500 500"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            {milledTicks}
          </svg>

          {/* Concentric Guilloché Hairline Rings */}
          <div
            style={{
              position: 'absolute',
              inset: 24,
              borderRadius: '50%',
              border: '2px dashed rgba(180, 83, 9, 0.38)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 42,
              borderRadius: '50%',
              border: '1.2px solid rgba(120, 113, 108, 0.28)',
              pointerEvents: 'none',
            }}
          />

          {/* Specular Ambient Light Sweep Reflection */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              overflow: 'hidden',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: 160,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.75) 50%, transparent 100%)',
                transform: `translateX(${shimmerPos}%) rotate(25deg)`,
              }}
            />
          </div>

          {/* Caustic Rim Glint Starburst Flare at t = 1.2s */}
          <div
            style={{
              position: 'absolute',
              top: 38,
              right: 72,
              width: 80,
              height: 80,
              opacity: glintOpacity,
              transform: `scale(${glintScale})`,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: 70,
                height: 4,
                backgroundColor: '#FFFFFF',
                borderRadius: 2,
                boxShadow: '0 0 16px #F59E0B, 0 0 8px #FFFFFF',
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: 4,
                height: 70,
                backgroundColor: '#FFFFFF',
                borderRadius: 2,
                boxShadow: '0 0 16px #F59E0B, 0 0 8px #FFFFFF',
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: '#FFFBEB',
                boxShadow: '0 0 20px #F59E0B',
              }}
            />
          </div>

          {/* Engraved Number on Coin Face */}
          <span
            style={{
              fontSize: 88,
              fontWeight: 900,
              letterSpacing: '-0.04em',
              color: '#1C1917',
              textShadow: '0 2px 4px rgba(255, 255, 255, 0.85), 0 -1px 2px rgba(68, 64, 60, 0.35)',
            }}
          >
            $10,000
          </span>
        </div>
      </div>

      {/* Monumental Kinetic Typography (Masked Reveal) */}
      <div
        style={{
          overflow: 'hidden',
          textAlign: 'center',
          maxWidth: 920,
        }}
      >
        <h1
          style={{
            fontSize: 92,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.035em',
            color: '#1C1917',
            margin: 0,
            transform: `translateY(${interpolate(titleEntrance, [0, 1], [110, 0])}px)`,
            opacity: Math.max(0, titleEntrance),
          }}
        >
          CAPITAL IS <br />
          <span
            style={{
              color: '#B45309',
              fontStyle: 'italic',
              fontFamily: 'serif',
              fontWeight: 700,
            }}
          >
            NOT STATIC.
          </span>
        </h1>
      </div>
    </div>
  );
};
