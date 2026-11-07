import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Shot6TheConclusionV2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const sceneEntrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 80 },
  });

  // Slow subtle camera expansion
  const cameraScale = interpolate(frame, [0, 300], [0.96, 1.03], {
    extrapolateRight: 'clamp',
  });

  // Phase transition (frame 120 / 4.0s into scene)
  // Phase 1: "THE NUMBER STAYED THE SAME."
  // Phase 2: "WHAT IT CAN BUY CHANGED."
  const phaseTransition = interpolate(frame, [110, 130], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Final hold
  const sceneOpacity = interpolate(frame, [270, 300], [1, 0.95], {
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
            'radial-gradient(1100px circle at 50% 40%, rgba(255, 255, 255, 0.98) 0%, rgba(246, 241, 232, 0.88) 55%, rgba(230, 222, 208, 0.85) 100%)',
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

        {/* Progressive Disclosure Statements */}
        <div style={{ textAlign: 'center', maxWidth: 940, minHeight: 280 }}>
          {/* Phase 1 (fades out during phaseTransition) */}
          <div
            style={{
              opacity: 1 - phaseTransition,
              transform: `translateY(${phaseTransition * -20}px)`,
              display: phaseTransition >= 1 ? 'none' : 'block',
            }}
          >
            <div
              style={{
                fontSize: 82,
                fontWeight: 800,
                lineHeight: 1.15,
                color: '#121316',
                letterSpacing: -1.5,
                textTransform: 'uppercase',
              }}
            >
              The Number
              <br />
              <span style={{ color: '#4B5563' }}>Stayed The Same.</span>
            </div>
          </div>

          {/* Phase 2 (fades in as phaseTransition progresses) */}
          <div
            style={{
              opacity: phaseTransition,
              transform: `translateY(${(1 - phaseTransition) * 20}px)`,
              display: phaseTransition <= 0 ? 'none' : 'block',
            }}
          >
            <div
              style={{
                fontSize: 88,
                fontWeight: 900,
                lineHeight: 1.12,
                color: '#121316',
                letterSpacing: -1.5,
                textTransform: 'uppercase',
              }}
            >
              What It Can Buy
              <br />
              <span style={{ color: '#B45309' }}>Changed.</span>
            </div>

            <div
              style={{
                marginTop: 28,
                fontSize: 34,
                fontWeight: 700,
                color: '#706A5F',
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              Never Mistake The Number For The Power.
            </div>
          </div>
        </div>

        {/* Mobile-Safe Educational Legal Footnote */}
        <div
          style={{
            position: 'absolute',
            bottom: 120,
            left: 80,
            right: 80,
            textAlign: 'center',
            fontSize: 24,
            fontWeight: 500,
            lineHeight: 1.45,
            color: '#8A8275',
            fontFamily: 'sans-serif',
            opacity: sceneEntrance,
          }}
        >
          Hypothetical illustration: $100 with 3% annual compound inflation over 20 years.
          <br />
          Individual prices and actual inflation rates vary. Educational analysis only, not financial advice.
        </div>
      </div>
    </div>
  );
};
