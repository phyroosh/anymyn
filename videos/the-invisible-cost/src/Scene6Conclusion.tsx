import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene6Conclusion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const sceneEntrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 80 },
  });

  // Slow subtle camera expansion
  const cameraScale = interpolate(frame, [0, 270], [0.96, 1.03], {
    extrapolateRight: 'clamp',
  });

  // Final resolve fade (frames 245 to 270)
  const sceneOpacity = interpolate(frame, [245, 270], [1, 0.95], {
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
      {/* Museum Warm Architectural Lighting */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(1100px circle at 50% 42%, rgba(255, 255, 255, 0.98) 0%, rgba(246, 241, 232, 0.88) 55%, rgba(230, 222, 208, 0.85) 100%)',
        }}
      />

      {/* Main Content Container */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 80px',
          transform: `scale(${cameraScale})`,
          zIndex: 20,
        }}
      >
        {/* Sculptural Monetary Seal Emblem */}
        <div
          style={{
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #EFECE1 0%, #D8D2BF 60%, #B8AF99 100%)',
            border: '6px solid #8F8772',
            boxShadow: '0 30px 60px rgba(70, 58, 38, 0.25), inset 0 3px 8px rgba(255,255,255,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            opacity: sceneEntrance,
            transform: `scale(${sceneEntrance})`,
            marginBottom: 60,
          }}
        >
          {/* Guilloché concentric rings */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            viewBox="0 0 320 320"
          >
            <circle cx="160" cy="160" r="142" fill="none" stroke="#7A715C" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="160" cy="160" r="126" fill="none" stroke="#7A715C" strokeWidth="2" />
            <circle cx="160" cy="160" r="105" fill="none" stroke="#7A715C" strokeWidth="1" strokeDasharray="4 4" />
          </svg>

          {/* Central Emblem Icon */}
          <div style={{ textAlign: 'center', zIndex: 5 }}>
            <div style={{ fontSize: 72 }}>⚖️</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#2B261D', letterSpacing: 4, marginTop: 8 }}>
              REAL POWER
            </div>
          </div>
        </div>

        {/* Monumental Hero Conclusion Typography */}
        <div style={{ textAlign: 'center', maxWidth: 940 }}>
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: '#666053',
              letterSpacing: 4,
              textTransform: 'uppercase',
              marginBottom: 20,
              opacity: sceneEntrance,
            }}
          >
            Money Is Not Just About How Much You Have.
          </div>

          <div
            style={{
              fontSize: 104,
              fontWeight: 900,
              lineHeight: 1.05,
              color: '#121316',
              letterSpacing: -2,
              textTransform: 'uppercase',
              opacity: sceneEntrance,
            }}
          >
            It Is About
            <br />
            <span style={{ color: '#047857' }}>What It Can Buy.</span>
          </div>

          <div
            style={{
              marginTop: 40,
              fontSize: 42,
              fontWeight: 700,
              color: '#7C2D12',
              letterSpacing: 3,
              textTransform: 'uppercase',
            }}
          >
            Never Mistake The Number For The Power.
          </div>
        </div>
      </div>

      {/* Mandatory Mobile-Safe Educational Disclosure Footnote */}
      <div
        style={{
          position: 'absolute',
          bottom: 220,
          left: 100,
          right: 100,
          textAlign: 'center',
          zIndex: 30,
        }}
      >
        <div
          style={{
            fontSize: 26,
            lineHeight: 1.45,
            fontWeight: 600,
            color: '#78716C',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Hypothetical 3% annual compound inflation model over 20 years. Illustrative of general price-level effects;
          individual goods and actual inflation rates vary. Educational analysis only, not financial advice.
        </div>
      </div>
    </div>
  );
};
