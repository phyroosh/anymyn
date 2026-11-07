import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Shot5TheRealizationV2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const sceneEntrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 85 },
  });

  // Shrinkage progress (from 100% down to 55.4% between frame 25 and 150)
  const coverageProgress = interpolate(frame, [25, 150], [100, 55.37], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Realization pulse at frame 150
  const pulse = spring({
    frame: frame - 150,
    fps,
    config: { damping: 12, stiffness: 110 },
  });

  // Scene exit fade out (frames 335 to 360)
  const sceneOpacity = interpolate(frame, [335, 360], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
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
      {/* Void Atmosphere with Subtle Emerald Radial Illumination */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(1100px circle at 50% 36%, rgba(16, 185, 129, 0.16) 0%, rgba(10, 15, 12, 0.95) 60%, rgba(6, 6, 8, 1) 100%)',
        }}
      />

      {/* Atmospheric directional shadow */}
      <div
        style={{
          position: 'absolute',
          top: 1320,
          left: 100,
          width: 880,
          height: 120,
          background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.8) 0%, rgba(6, 6, 8, 0) 70%)',
          filter: 'blur(35px)',
        }}
      />

      {/* Hero Motion Headline — ONE SHOT. ONE IDEA. */}
      <div
        style={{
          position: 'absolute',
          top: 220,
          left: 60,
          right: 60,
          textAlign: 'center',
          zIndex: 30,
        }}
      >
        <div
          style={{
            fontSize: 78,
            fontWeight: 800,
            lineHeight: 1.12,
            color: '#FFFFFF',
            letterSpacing: -1.5,
            textTransform: 'uppercase',
            opacity: sceneEntrance,
          }}
        >
          Your $100
          <br />
          <span style={{ color: '#10B981' }}>Now Buys About 55%.</span>
        </div>
      </div>

      {/* Central Visual Focus: Side-by-side $100 Banknote vs 55% Capacity Basket */}
      <div
        style={{
          position: 'absolute',
          top: 580,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${sceneEntrance})`,
          zIndex: 20,
        }}
      >
        {/* Physical Comparison Container */}
        <div
          style={{
            width: 860,
            padding: '40px 30px',
            borderRadius: 32,
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
            border: '2px solid rgba(16, 185, 129, 0.35)',
            boxShadow: '0 30px 70px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Top Row: Unchanged $100 Bill and Visual Basket */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
            {/* Unchanged $100 Note */}
            <div
              style={{
                width: 340,
                height: 190,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #DFDAC9 0%, #C4BCA5 100%)',
                border: '3px solid #8A816B',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 700, color: '#453E2E', letterSpacing: 2 }}>UNCHANGED NOTE</div>
              <div style={{ fontSize: 64, fontWeight: 900, color: '#1B1914', fontFamily: 'serif', marginTop: 4 }}>$100</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#3B82F6', marginTop: 4 }}>THE SAME NUMBER</div>
            </div>

            {/* Arrow */}
            <div style={{ fontSize: 44, color: '#64748B' }}>➔</div>

            {/* Shopping Basket Representation */}
            <div
              style={{
                width: 340,
                height: 190,
                borderRadius: 14,
                background: 'rgba(30, 41, 59, 0.6)',
                border: '3px solid #334155',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: 48 }}>🧺</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#94A3B8', letterSpacing: 2, marginTop: 4 }}>BASKET COVERED</div>
              <div style={{ fontSize: 52, fontWeight: 900, color: '#10B981', fontFamily: 'monospace', marginTop: 4 }}>
                {coverageProgress.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Monumental Fill Capacity Level Meter */}
          <div style={{ width: '100%', marginTop: 50, padding: '0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: '#E2E8F0', letterSpacing: 2 }}>
                WHAT YOUR $100 COMMANDS TODAY
              </span>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#10B981' }}>
                ~55% OF THE BASKET
              </span>
            </div>

            {/* The Meter Track */}
            <div
              style={{
                width: '100%',
                height: 48,
                borderRadius: 24,
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Active Fill Level */}
              <div
                style={{
                  width: `${coverageProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #059669 0%, #10B981 100%)',
                  borderRadius: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: 20,
                  boxShadow: '0 0 25px rgba(16, 185, 129, 0.5)',
                }}
              >
                <span style={{ fontSize: 24, fontWeight: 900, color: '#FFFFFF' }}>$55.37 VALUE</span>
              </div>
            </div>

            {/* Simple Conversational Explanatory Subtext */}
            <div
              style={{
                marginTop: 28,
                textAlign: 'center',
                fontSize: 34,
                fontWeight: 700,
                color: '#CBD5E1',
                lineHeight: 1.35,
              }}
            >
              Your money didn't disappear.
              <br />
              <span style={{ color: '#F59E0B' }}>It just buys less than before.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
