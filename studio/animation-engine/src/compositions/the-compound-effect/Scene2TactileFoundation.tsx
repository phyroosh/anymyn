import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene2TactileFoundation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance crossfade
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [310, 330], [1, 0], { extrapolateLeft: 'clamp' });

  // Camera subtle drift
  const cameraScale = interpolate(frame, [0, 330], [0.96, 1.03], { extrapolateRight: 'clamp' });
  const cameraY = interpolate(frame, [0, 330], [10, -10], { extrapolateRight: 'clamp' });

  // Text reveals
  const headerFade = interpolate(frame, [10, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const headerY = interpolate(frame, [10, 35], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // The 10 Gold Ingots ($1,000 each)
  // Grid: 2 columns x 5 rows
  const ingots = Array.from({ length: 10 }).map((_, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    // Staggered entrance timing (frames 25 to 145)
    const delay = 25 + i * 11;
    const slideSpring = spring({
      frame: frame - delay,
      fps,
      config: { damping: 18, stiffness: 85, mass: 0.9 },
    });

    const startX = col === 0 ? -450 : 450;
    const startY = (row - 2) * 95 - 120;
    const targetX = col === 0 ? -195 : 15;
    const targetY = row * 90 - 220;

    const currentX = interpolate(slideSpring, [0, 1], [startX, targetX]);
    const currentY = interpolate(slideSpring, [0, 1], [startY, targetY]);
    const ingotOpacity = interpolate(frame - delay, [0, 10], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    // Compression into solid slab after frame 170
    const compressProgress = interpolate(frame, [170, 210], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const finalX = col === 0 ? -185 : 5;
    const finalY = row * 82 - 200;
    const renderX = interpolate(compressProgress, [0, 1], [currentX, finalX]);
    const renderY = interpolate(compressProgress, [0, 1], [currentY, finalY]);

    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 180,
          height: 74,
          transform: `translate(${renderX}px, ${renderY}px)`,
          opacity: ingotOpacity,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #FFF6D6 0%, #E8BE60 30%, #BA892B 70%, #7A5312 100%)',
          boxShadow: '0 12px 24px rgba(45, 32, 12, 0.28), inset 0 1px 2px rgba(255, 255, 255, 0.7)',
          border: '1px solid #754E0E',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <span
          style={{
            fontFamily: '"Cinzel", "Playfair Display", Georgia, serif',
            fontSize: 18,
            fontWeight: 700,
            color: '#382507',
            letterSpacing: 0.5,
          }}
        >
          $1,000
        </span>
        <span
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: 9.5,
            fontWeight: 700,
            color: '#634410',
            letterSpacing: 2,
          }}
        >
          INGOT 0{i + 1} • 999.9
        </span>
      </div>
    );
  });

  // Consolidated slab highlight pulse at frame 215
  const slabGlow = interpolate(frame, [210, 225, 250], [0, 1, 0.4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: '#F0ECE1',
        position: 'relative',
        overflow: 'hidden',
        opacity: fadeIn * fadeOut,
        fontFamily: '"Cinzel", "Playfair Display", "Times New Roman", serif',
      }}
    >
      {/* Background Architectural Atmosphere */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(1000px circle at 50% 45%, rgba(255, 255, 255, 0.9) 0%, rgba(240, 235, 222, 0.8) 50%, rgba(225, 218, 202, 0.9) 100%)',
        }}
      />

      {/* Grid texture */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: 1080,
          height: 1920,
          opacity: 0.15,
          pointerEvents: 'none',
        }}
      >
        <defs>
          <pattern id="plinthGrid" width="90" height="90" patternUnits="userSpaceOnUse">
            <path d="M 90 0 L 0 0 0 90" fill="none" stroke="#54432A" strokeWidth="0.8" strokeDasharray="2,4" />
          </pattern>
        </defs>
        <rect width="1080" height="1920" fill="url(#plinthGrid)" />
      </svg>

      {/* Camera Viewport */}
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${cameraScale}) translateY(${cameraY}px)`,
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
            opacity: headerFade,
            transform: `translateY(${headerY}px)`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(110, 85, 30, 0.3)',
              paddingBottom: 14,
            }}
          >
            <span
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 4,
                color: '#8A6B29',
                textTransform: 'uppercase',
              }}
            >
              ANYMYN EDITORIAL • CHAPTER II
            </span>
            <span
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: 2,
                color: '#655740',
              }}
            >
              THE CAPITAL BASE
            </span>
          </div>

          <h2
            style={{
              margin: '22px 0 0 0',
              fontSize: 52,
              fontWeight: 400,
              lineHeight: 1.15,
              color: '#1A1612',
            }}
          >
            Ten Thousand Dollars
            <br />
            <span style={{ fontStyle: 'italic', fontWeight: 600, color: '#8A6B29' }}>
              is a physical foundation.
            </span>
          </h2>

          <p
            style={{
              margin: '12px 0 0 0',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: 20,
              color: '#554B3B',
              lineHeight: 1.45,
            }}
          >
            Left alone in a vault, it remains unchanged. But put to work, it acquires the ability to replicate.
          </p>
        </div>

        {/* Central Foundation Plinth */}
        <div
          style={{
            position: 'absolute',
            top: 680,
            left: 140,
            width: 800,
            height: 600,
          }}
        >
          {/* Architectural Limestone Bed */}
          <div
            style={{
              position: 'absolute',
              top: 50,
              left: 140,
              width: 520,
              height: 480,
              borderRadius: 24,
              backgroundColor: '#E5DFC8',
              boxShadow: '0 30px 60px rgba(60, 48, 25, 0.18), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
              border: '2px solid rgba(138, 107, 41, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingBottom: 25,
            }}
          >
            {/* Guide markers on plinth */}
            <div
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 3,
                color: '#8A6B29',
                opacity: 0.85,
              }}
            >
              ASSEMBLING 10 × $1,000 PRINCIPAL INGOTS
            </div>
          </div>

          {/* Golden glow aura around assembled slab */}
          <div
            style={{
              position: 'absolute',
              top: 50,
              left: 140,
              width: 520,
              height: 480,
              borderRadius: 24,
              boxShadow: `0 0 ${40 * slabGlow}px rgba(227, 183, 85, ${0.5 * slabGlow})`,
              pointerEvents: 'none',
            }}
          />

          {/* Render the 10 sliding ingots */}
          {ingots}
        </div>

        {/* Consolidated Total Lockup */}
        <div
          style={{
            position: 'absolute',
            bottom: 220,
            left: 90,
            right: 90,
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(12px)',
            borderRadius: 18,
            padding: '22px 32px',
            border: '1px solid rgba(138, 107, 41, 0.35)',
            boxShadow: '0 15px 35px rgba(50, 40, 20, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            opacity: interpolate(frame, [150, 180], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 2.5,
                color: '#8A6B29',
              }}
            >
              UNIFIED CAPITAL BASE
            </div>
            <div
              style={{
                fontFamily: '"Cinzel", Georgia, serif',
                fontSize: 42,
                fontWeight: 700,
                color: '#1C160F',
                letterSpacing: -0.5,
              }}
            >
              $10,000.00
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 2.5,
                color: '#10B981',
              }}
            >
              ANNUAL YIELD POTENTIAL
            </div>
            <div
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 32,
                fontWeight: 800,
                color: '#065F46',
              }}
            >
              +10.0% / YR
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
