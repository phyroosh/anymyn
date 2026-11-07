import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Shot1BullionOpening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cinematic macro camera movement: slow, majestic push-in + subtle tilt drift
  const cameraZoom = interpolate(frame, [0, 96], [0.98, 1.10], {
    extrapolateRight: 'clamp',
  });
  const cameraTilt = interpolate(frame, [0, 96], [-1.8, 2.2], {
    extrapolateRight: 'clamp',
  });
  const cameraDriftY = interpolate(frame, [0, 96], [14, -10], {
    extrapolateRight: 'clamp',
  });

  // Entrance spring animations
  const titleEntrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 85 },
  });

  const coinEntrance = spring({
    frame: frame - 6,
    fps,
    config: { damping: 12, mass: 1.0, stiffness: 75 },
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

  // Generate 72 milled edge tick marks for authentic bullion coin detail
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
        justifyContent: 'space-between',
        padding: '240px 80px 180px 80px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Subtle Architectural Grid Hairlines */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.18,
          pointerEvents: 'none',
        }}
      >
        <line x1="80" y1="0" x2="80" y2="1920" stroke="#78716C" strokeWidth="1" strokeDasharray="4 8" />
        <line x1="1000" y1="0" x2="1000" y2="1920" stroke="#78716C" strokeWidth="1" strokeDasharray="4 8" />
        <line x1="0" y1="280" x2="1080" y2="280" stroke="#78716C" strokeWidth="1" strokeDasharray="4 8" />
        <line x1="0" y1="1660" x2="1080" y2="1660" stroke="#78716C" strokeWidth="1" strokeDasharray="4 8" />
      </svg>

      {/* Top Editorial Monograph Masthead (No chapter labels) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          opacity: interpolate(frame, [0, 20], [0, 1]),
          transform: `translateY(${interpolate(frame, [0, 20], [-10, 0])}px)`,
          borderBottom: '1px solid rgba(120, 113, 108, 0.22)',
          paddingBottom: 22,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#B45309',
            }}
          />
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '0.26em',
              textTransform: 'uppercase',
              color: '#44403C',
            }}
          >
            ANYMYN MONOGRAPHS
          </span>
        </div>
        <span
          style={{
            fontSize: 18,
            fontFamily: 'monospace',
            color: '#78716C',
            letterSpacing: '0.12em',
          }}
        >
          VOL. V • THE COMPOUND ENGINE
        </span>
      </div>

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
        }}
      >
        {/* Multi-layered soft cast occlusion shadow on ivory plane */}
        <div
          style={{
            position: 'absolute',
            width: 520,
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
            width: 500,
            height: 500,
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
              inset: 22,
              borderRadius: '50%',
              border: '2px dashed rgba(180, 83, 9, 0.38)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 38,
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
                width: 150,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.75) 50%, transparent 100%)',
                transform: `translateX(${shimmerPos}%) rotate(25deg)`,
              }}
            />
          </div>

          {/* Caustic Rim Glint Starburst Flare at t = 1.2s */}
          <div
            style={{
              position: 'absolute',
              top: 36,
              right: 68,
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

          {/* Medallion Engraved Typography */}
          <span
            style={{
              fontSize: 18,
              letterSpacing: '0.34em',
              fontWeight: 800,
              color: '#78716C',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            INITIAL PRINCIPAL
          </span>
          <span
            style={{
              fontSize: 82,
              fontWeight: 900,
              letterSpacing: '-0.04em',
              color: '#1C1917',
              textShadow: '0 2px 4px rgba(255, 255, 255, 0.85), 0 -1px 2px rgba(68, 64, 60, 0.35)',
            }}
          >
            $10,000
          </span>
          <span
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: '#B45309',
              marginTop: 8,
              letterSpacing: '0.06em',
              fontFamily: 'serif',
              fontStyle: 'italic',
            }}
          >
            The Foundational Base
          </span>
        </div>

        {/* Tangible Spec Anchor Tag */}
        <div
          style={{
            marginTop: 44,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(120, 113, 108, 0.25)',
            padding: '12px 30px',
            borderRadius: 8,
            boxShadow: '0 8px 22px rgba(0,0,0,0.05)',
            opacity: interpolate(frame, [25, 45], [0, 1]),
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: '#1C1917', letterSpacing: '0.05em' }}>
            CAGR: 10.0% ANNUAL
          </span>
          <div style={{ width: 1, height: 16, backgroundColor: '#A8A29E' }} />
          <span style={{ fontSize: 16, fontWeight: 600, color: '#78716C' }}>
            HORIZON: 30 YEARS
          </span>
        </div>
      </div>

      {/* Bottom Editorial Thesis Headline */}
      <div
        style={{
          opacity: Math.max(0, titleEntrance),
          transform: `translateY(${interpolate(frame, [0, 30], [25, 0])}px)`,
        }}
      >
        <h1
          style={{
            fontSize: 54,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
            color: '#1C1917',
            margin: 0,
            marginBottom: 16,
          }}
        >
          A single seed of capital <br />
          <span style={{ color: '#B45309', fontStyle: 'italic', fontFamily: 'serif', fontWeight: 600 }}>
            is not static.
          </span>
        </h1>
        <p
          style={{
            fontSize: 26,
            lineHeight: 1.45,
            color: '#57534E',
            margin: 0,
            maxWidth: 840,
            fontWeight: 450,
          }}
        >
          Every cycle, returns fold back into the base—powering continuous acceleration.
        </p>
      </div>
    </div>
  );
};
