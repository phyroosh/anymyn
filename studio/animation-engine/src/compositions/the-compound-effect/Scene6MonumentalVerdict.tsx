import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene6MonumentalVerdict: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Crossfade entrance
  const fadeIn = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });

  // Camera slow cinematic push
  const cameraScale = interpolate(frame, [0, 405], [0.95, 1.04], { extrapolateRight: 'clamp' });
  const cameraY = interpolate(frame, [0, 405], [15, -10], { extrapolateRight: 'clamp' });

  // Staggered reveals
  const mastheadFade = interpolate(frame, [15, 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const numberSpring = spring({
    frame: frame - 45,
    fps,
    config: { damping: 15, stiffness: 85, mass: 1.1 },
  });
  const numberOpacity = interpolate(frame, [45, 75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const thesisFade = interpolate(frame, [120, 160], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const thesisY = interpolate(frame, [120, 160], [25, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const multiplierFade = interpolate(frame, [190, 230], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const multiplierScale = spring({
    frame: frame - 190,
    fps,
    config: { damping: 14, stiffness: 90, mass: 1.0 },
  });

  const disclaimerFade = interpolate(frame, [250, 290], [0, 0.75], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: '#060608',
        position: 'relative',
        overflow: 'hidden',
        opacity: fadeIn,
        fontFamily: '"Cinzel", "Playfair Display", Georgia, serif',
      }}
    >
      {/* Museum Obsidian Ambient Light */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(1100px circle at 50% 36%, rgba(212, 175, 55, 0.15) 0%, rgba(10, 9, 8, 0.95) 70%, #040405 100%)',
        }}
      />

      {/* Radiant golden light rays */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 400,
          width: 280,
          height: 1920,
          background: 'linear-gradient(180deg, rgba(253, 230, 138, 0.08) 0%, rgba(16, 185, 129, 0.04) 60%, transparent 100%)',
          filter: 'blur(35px)',
          pointerEvents: 'none',
        }}
      />

      {/* Camera Viewport */}
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${cameraScale}) translateY(${cameraY}px)`,
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
            opacity: mastheadFade,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(212, 175, 55, 0.35)',
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
              ANYMYN EDITORIAL • CONCLUSION
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
              THIRTY-YEAR PAYOFF
            </span>
          </div>

          <h2
            style={{
              margin: '22px 0 0 0',
              fontSize: 52,
              fontWeight: 400,
              lineHeight: 1.15,
              color: '#FAF8F4',
            }}
          >
            From Ten Thousand
            <br />
            <span style={{ fontStyle: 'italic', fontWeight: 600, color: '#D4AF37' }}>
              to a monumental fortune.
            </span>
          </h2>
        </div>

        {/* Central Monumental Payoff Lockup */}
        <div
          style={{
            position: 'absolute',
            top: 590,
            left: 90,
            right: 90,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* Stepped Pedestal Base Silhouette */}
          <div
            style={{
              width: 320,
              height: 20,
              background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.4), transparent)',
              marginBottom: 20,
            }}
          />

          <span
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 4,
              color: '#D4AF37',
              textTransform: 'uppercase',
              opacity: mastheadFade,
            }}
          >
            FINAL ACCUMULATED CAPITAL
          </span>

          {/* The $174,494.02 Monumental Figure */}
          <div
            style={{
              fontFamily: '"Cinzel", "Playfair Display", Georgia, serif',
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1.05,
              color: '#FFFFFF',
              letterSpacing: -1,
              marginTop: 12,
              textShadow: '0 0 35px rgba(212, 175, 55, 0.45), 0 0 80px rgba(16, 185, 129, 0.25)',
              opacity: numberOpacity,
              transform: `scale(${numberSpring})`,
            }}
          >
            $174,494
          </div>

          <div
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: 22,
              fontWeight: 700,
              color: '#10B981',
              marginTop: 10,
              letterSpacing: 1,
              opacity: numberOpacity,
            }}
          >
            17.45× ORIGINAL CAPITAL • +$164,494 PROFIT
          </div>

          {/* Divergence Multiplier Capsule */}
          <div
            style={{
              marginTop: 36,
              padding: '16px 36px',
              borderRadius: 30,
              backgroundColor: 'rgba(212, 175, 55, 0.12)',
              border: '1.5px solid rgba(212, 175, 55, 0.5)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              opacity: multiplierFade,
              transform: `scale(${multiplierScale})`,
            }}
          >
            <span
              style={{
                fontFamily: '"Cinzel", Georgia',
                fontSize: 32,
                fontWeight: 700,
                color: '#FDE68A',
              }}
            >
              4.36×
            </span>
            <span
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 15,
                fontWeight: 600,
                color: '#E2E8F0',
                letterSpacing: 0.5,
                textAlign: 'left',
              }}
            >
              The ending balance of simple interest
              <br />
              <span style={{ color: '#94A3B8', fontSize: 13 }}>
                ($174,494 vs. $40,000 at identical rate and time)
              </span>
            </span>
          </div>

          {/* Central Philosophical Thesis Lockup */}
          <div
            style={{
              marginTop: 50,
              maxWidth: 720,
              opacity: thesisFade,
              transform: `translateY(${thesisY}px)`,
              backgroundColor: 'rgba(20, 18, 15, 0.75)',
              backdropFilter: 'blur(16px)',
              borderRadius: 18,
              padding: '28px 36px',
              border: '1px solid rgba(212, 175, 55, 0.25)',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 400,
                lineHeight: 1.35,
                color: '#F5EFE6',
                fontStyle: 'italic',
              }}
            >
              &ldquo;Your returns can become the foundation for your next returns.&rdquo;
            </p>
            <p
              style={{
                margin: '14px 0 0 0',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: 16,
                fontWeight: 700,
                color: '#D4AF37',
                letterSpacing: 2.5,
                textTransform: 'uppercase',
              }}
            >
              TIME IS NOT JUST A WAITING ROOM. IT IS THE MULTIPLIER.
            </p>
          </div>
        </div>

        {/* Compliant Educational Disclaimer Footnote (Inside 9:16 safe area) */}
        <div
          style={{
            position: 'absolute',
            bottom: 190,
            left: 90,
            right: 90,
            borderTop: '1px solid rgba(148, 163, 184, 0.2)',
            paddingTop: 16,
            opacity: disclaimerFade,
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: 11.5,
              fontWeight: 500,
              color: '#64748B',
              lineHeight: 1.5,
              textAlign: 'center',
              letterSpacing: 0.3,
            }}
          >
            HYPOTHETICAL MATHEMATICAL MODEL ($10,000 PRINCIPAL, 10% ANNUAL EFFECTIVE RETURN FOR 30 YEARS, ANNUAL COMPOUNDING).
            <br />
            ASSUMES NO WITHDRAWALS, FEES, OR TAXES. DOES NOT REPRESENT ACTUAL OR GUARANTEED INVESTMENT PERFORMANCE. FOR EDUCATIONAL PURPOSES ONLY.
          </p>
        </div>
      </div>
    </div>
  );
};
