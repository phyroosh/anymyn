import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene5VisualPayoff: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const sceneEntrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 85 },
  });

  // Dissolution progression (frames 30 to 170)
  const dissolveProgress = interpolate(frame, [30, 170], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Laser beam slice position (from 100% down to 55.37%)
  const slicePercent = interpolate(dissolveProgress, [0, 1], [100, 55.37]);

  // Monolith column reveal (starts at frame 105 when voice mentions bank statement)
  const columnGrow = spring({
    frame: frame - 105,
    fps,
    config: { damping: 18, stiffness: 80 },
  });
  const columnOpacity = interpolate(frame, [105, 130], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Exit fade out (frames 335 to 360)
  const sceneOpacity = interpolate(frame, [335, 360], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Generate 28 deterministic particle coordinates
  const particles = Array.from({ length: 28 }).map((_, i) => {
    const seedX = (i * 47) % 700;
    const seedY = (i * 31) % 150;
    const speed = 0.8 + ((i * 13) % 10) * 0.15;
    const currentY = seedY - (frame - 30) * speed * 2.2;
    const opacity = interpolate(currentY, [-180, 0, 140], [0, 0.9, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return {
      x: seedX,
      y: currentY,
      size: 4 + (i % 4) * 2.5,
      opacity: frame > 30 ? opacity : 0,
    };
  });

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: '#060608',
        position: 'relative',
        overflow: 'hidden',
        opacity: sceneOpacity,
        fontFamily: '"Cinzel", "Playfair Display", "Times New Roman", serif',
      }}
    >
      {/* Void Atmosphere with Deep Thermal Amber Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(1100px circle at 50% 36%, rgba(180, 83, 9, 0.22) 0%, rgba(18, 10, 6, 0.95) 60%, rgba(6, 6, 8, 1) 100%)',
        }}
      />

      {/* Hero Motion Typography */}
      <div
        style={{
          position: 'absolute',
          top: 200,
          left: 60,
          right: 60,
          textAlign: 'center',
          zIndex: 30,
        }}
      >
        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            lineHeight: 1.08,
            color: '#FFFFFF',
            letterSpacing: -1.5,
            textTransform: 'uppercase',
            opacity: sceneEntrance,
          }}
        >
          The Balance Stays.
          <br />
          <span style={{ color: '#F59E0B' }}>The Value Vanishes.</span>
        </div>

        <div
          style={{
            marginTop: 20,
            fontSize: 38,
            fontWeight: 700,
            color: '#A3A3A3',
            letterSpacing: 3,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          Inflation Takes What Money Can Do
        </div>
      </div>

      {/* The Dissolving Banknote Stage */}
      <div
        style={{
          position: 'absolute',
          top: 560,
          left: 140,
          right: 140,
          height: 440,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
        }}
      >
        <div
          style={{
            width: 760,
            height: 380,
            borderRadius: 18,
            position: 'relative',
            overflow: 'hidden',
            border: '3px solid #78716C',
            boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
            background: '#1C1917',
          }}
        >
          {/* Bottom Solid Remaining Banknote ($55.37) */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${slicePercent}%`,
              background: 'linear-gradient(135deg, #10B981 0%, #047857 50%, #064E3B 100%)',
              borderTop: '4px solid #34D399',
              boxShadow: '0 -10px 25px rgba(52, 211, 153, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '24px 32px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: '#A7F3D0', letterSpacing: 2 }}>
                SURVIVING REAL VALUE
              </span>
              <span style={{ fontSize: 44, fontWeight: 900, color: '#FFFFFF', fontFamily: 'monospace' }}>
                $55.37
              </span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#D1FAE5' }}>
              55.4% OF INITIAL PURCHASING POWER RETAINED
            </div>
          </div>

          {/* Top Dissolving Area (44.63%) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: `${slicePercent}%`,
              background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.15) 0%, rgba(245, 158, 11, 0.25) 100%)',
              borderBottom: '3px dashed #F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: '#FCA5A5',
                letterSpacing: 3,
                textTransform: 'uppercase',
                opacity: dissolveProgress,
              }}
            >
              −44.6% INVISIBLE DISSOLVE
            </div>

            {/* Floating Golden Ember Particles */}
            {particles.map((p, idx) => (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: p.x,
                  top: p.y,
                  width: p.size,
                  height: p.size,
                  borderRadius: '50%',
                  backgroundColor: '#FDE047',
                  boxShadow: '0 0 8px #F59E0B',
                  opacity: p.opacity,
                  pointerEvents: 'none',
                }}
              />
            ))}
          </div>

          {/* Luminous Cutting Laser Horizon */}
          <div
            style={{
              position: 'absolute',
              bottom: `${slicePercent}%`,
              left: 0,
              right: 0,
              height: 4,
              backgroundColor: '#FFFFFF',
              boxShadow: '0 0 15px #34D399, 0 0 30px #10B981',
              zIndex: 10,
            }}
          />
        </div>
      </div>

      {/* Side-by-Side Monumental Columns Comparison (Revealed at frame 105) */}
      <div
        style={{
          position: 'absolute',
          bottom: 220,
          left: 100,
          right: 100,
          height: 460,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'flex-end',
          zIndex: 25,
          opacity: columnOpacity,
          transform: `translateY(${(1 - columnGrow) * 35}px)`,
        }}
      >
        {/* Nominal Column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 380 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#9CA3AF', marginBottom: 10, letterSpacing: 2 }}>
            NOMINAL ACCOUNT
          </div>
          <div style={{ fontSize: 52, fontWeight: 900, color: '#FFFFFF', marginBottom: 14 }}>
            $100.00
          </div>
          <div
            style={{
              width: 320,
              height: 300 * columnGrow,
              borderRadius: '16px 16px 0 0',
              background: 'linear-gradient(180deg, #4B5563 0%, #1F2937 100%)',
              border: '2px solid #6B7280',
              borderBottom: 'none',
              boxShadow: '0 -10px 25px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {columnGrow > 0.3 && (
              <span style={{ fontSize: 26, fontWeight: 800, color: '#E5E7EB', transform: 'rotate(-90deg)', letterSpacing: 2 }}>
                100% NUMBER
              </span>
            )}
          </div>
        </div>

        {/* Real Purchasing Power Column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 380 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#34D399', marginBottom: 10, letterSpacing: 2 }}>
            REAL PURCHASING POWER
          </div>
          <div style={{ fontSize: 52, fontWeight: 900, color: '#34D399', marginBottom: 14 }}>
            $55.37
          </div>
          <div
            style={{
              width: 320,
              height: (300 * 0.5537) * columnGrow,
              borderRadius: '16px 16px 0 0',
              background: 'linear-gradient(180deg, #10B981 0%, #064E3B 100%)',
              border: '2px solid #34D399',
              borderBottom: 'none',
              boxShadow: '0 -10px 25px rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {columnGrow > 0.3 && (
              <span style={{ fontSize: 26, fontWeight: 800, color: '#FFFFFF', letterSpacing: 1 }}>
                55.4% REALITY
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
