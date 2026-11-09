import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from './theme';

export const Shot1TwoPlinths: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrances
  const badgeSpring = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 90 } });
  const headlineSpring = spring({ frame: frame - 10, fps, config: { damping: 15, stiffness: 85 } });
  
  const plinthLeftSpring = spring({ frame: frame - 16, fps, config: { damping: 14, stiffness: 75 } });
  const plinthRightSpring = spring({ frame: frame - 24, fps, config: { damping: 14, stiffness: 75 } });
  
  const bridgeSpring = spring({ frame: frame - 55, fps, config: { damping: 13, stiffness: 85 } });

  // Camera drift
  const scale = interpolate(frame, [0, 165], [0.98, 1.025], { extrapolateRight: 'clamp' });
  const cameraY = interpolate(frame, [0, 165], [0, -10], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `scale(${scale}) translateY(${cameraY}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: THEME.layout.safeArea.top - 20,
        fontFamily: THEME.typography.fontSans,
      }}
    >
      {/* 1. Header Badge */}
      <div
        style={{
          opacity: badgeSpring,
          transform: `translateY(${(1 - badgeSpring) * -15}px)`,
          padding: '8px 24px',
          borderRadius: 24,
          backgroundColor: 'rgba(197, 138, 53, 0.12)',
          border: '1.5px solid rgba(197, 138, 53, 0.35)',
          color: THEME.colors.accentGold,
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: 2.5,
          textTransform: 'uppercase',
          marginBottom: 16,
        }}
      >
        The Salary Paradox
      </div>

      {/* 2. Main Headline */}
      <h1
        style={{
          opacity: headlineSpring,
          transform: `translateY(${(1 - headlineSpring) * 20}px)`,
          fontFamily: THEME.typography.fontSerif,
          fontSize: 72,
          fontWeight: 800,
          color: THEME.colors.textPrimary,
          textAlign: 'center',
          maxWidth: 940,
          lineHeight: 1.15,
          margin: '0 0 30px 0',
          letterSpacing: -1.0,
        }}
      >
        Earning more doesn't always make you richer.
      </h1>

      {/* 3. Stage Container: Dual Grounded Plinths on Perspective Floor */}
      <div
        style={{
          position: 'relative',
          width: 960,
          height: 980,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          padding: '0 40px 40px 40px',
        }}
      >
        {/* Central Comparative Equalizer Callout */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: `translateX(-50%) scale(${bridgeSpring})`,
            opacity: bridgeSpring,
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: '#FAF7F0',
              padding: '10px 26px',
              borderRadius: 24,
              border: `2.5px solid ${THEME.colors.accentGold}`,
              boxShadow: '0 12px 30px rgba(197, 138, 53, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 22,
              fontWeight: 800,
              color: THEME.colors.textPrimary,
            }}
          >
            <span style={{ color: THEME.colors.accentGold, fontSize: 26 }}>=</span>
            <span>₹3,000 SAVINGS (UNCHANGED)</span>
          </div>

          {/* Caliper connector lines to both plinth vaults */}
          <svg width="960" height="260" style={{ marginTop: 4, overflow: 'visible' }}>
            <path
              d="M 230 230 Q 480 20 730 110"
              fill="none"
              stroke={THEME.colors.accentGold}
              strokeWidth="2.5"
              strokeDasharray="6 4"
              opacity="0.8"
            />
            <circle cx="230" cy="230" r="5" fill={THEME.colors.accentGold} />
            <circle cx="730" cy="110" r="5" fill={THEME.colors.accentGold} />
          </svg>
        </div>

        {/* --- PLINTH A: ₹30,000 BASELINE --- */}
        <div
          style={{
            width: 380,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: plinthLeftSpring,
            transform: `translateY(${(1 - plinthLeftSpring) * 80}px)`,
            zIndex: 5,
          }}
        >
          {/* Glass Savings Cube on top */}
          <div
            style={{
              width: 220,
              height: 150,
              borderRadius: 18,
              backgroundColor: 'rgba(255, 255, 255, 0.82)',
              border: '2.5px solid rgba(197, 138, 53, 0.55)',
              boxShadow: '0 16px 35px rgba(80, 68, 52, 0.15), inset 0 2px 10px rgba(255, 255, 255, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: THEME.colors.textSecondary, letterSpacing: 1.5 }}>
              SAVINGS
            </div>
            <div style={{ fontFamily: THEME.typography.fontSerif, fontSize: 44, fontWeight: 900, color: THEME.colors.accentGold }}>
              ₹3,000
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: THEME.colors.accentEmerald, marginTop: 4 }}>
              10.0% SAVED
            </div>
          </div>

          {/* Monolithic Plinth Body */}
          <div
            style={{
              width: 360,
              height: 480,
              borderRadius: 20,
              background: 'linear-gradient(180deg, #F0EAE1 0%, #E3D9C9 100%)',
              border: `2.5px solid ${THEME.colors.plinthBorder}`,
              boxShadow: '0 24px 50px rgba(80, 68, 52, 0.22)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingTop: 36,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, color: THEME.colors.textSecondary, letterSpacing: 1.5 }}>
              MONTHLY INCOME
            </div>
            <div style={{ fontFamily: THEME.typography.fontSerif, fontSize: 62, fontWeight: 900, color: THEME.colors.textPrimary, marginTop: 8 }}>
              ₹30,000
            </div>
            <div
              style={{
                marginTop: 45,
                padding: '8px 24px',
                borderRadius: 18,
                backgroundColor: 'rgba(117, 106, 91, 0.12)',
                fontSize: 20,
                fontWeight: 700,
                color: THEME.colors.textSecondary,
              }}
            >
              Baseline
            </div>
          </div>

          {/* Ground Contact Shadow */}
          <div
            style={{
              width: 350,
              height: 28,
              borderRadius: '50%',
              backgroundColor: THEME.colors.shadowContact,
              filter: 'blur(10px)',
              marginTop: -14,
            }}
          />
        </div>

        {/* --- PLINTH B: ₹40,000 RAISE (+33% TALLER) --- */}
        <div
          style={{
            width: 380,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: plinthRightSpring,
            transform: `translateY(${(1 - plinthRightSpring) * 80}px)`,
            zIndex: 5,
          }}
        >
          {/* Glass Savings Cube on top */}
          <div
            style={{
              width: 220,
              height: 150,
              borderRadius: 18,
              backgroundColor: 'rgba(255, 255, 255, 0.82)',
              border: '2.5px solid rgba(197, 138, 53, 0.55)',
              boxShadow: '0 16px 35px rgba(80, 68, 52, 0.15), inset 0 2px 10px rgba(255, 255, 255, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: THEME.colors.textSecondary, letterSpacing: 1.5 }}>
              SAVINGS
            </div>
            <div style={{ fontFamily: THEME.typography.fontSerif, fontSize: 44, fontWeight: 900, color: THEME.colors.accentGold }}>
              ₹3,000
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: THEME.colors.accentCrimson, marginTop: 4 }}>
              ONLY 7.5% SAVED
            </div>
          </div>

          {/* Monolithic Plinth Body (Taller) */}
          <div
            style={{
              width: 360,
              height: 600,
              borderRadius: 20,
              background: 'linear-gradient(180deg, #F5EFE6 0%, #E7DBCB 100%)',
              border: `3px solid ${THEME.colors.accentGold}`,
              boxShadow: '0 28px 60px rgba(80, 68, 52, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingTop: 36,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -18,
                padding: '6px 20px',
                borderRadius: 16,
                backgroundColor: THEME.colors.accentGold,
                color: '#FAF7F0',
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: 1.5,
                boxShadow: '0 4px 14px rgba(197, 138, 53, 0.35)',
              }}
            >
              +33.3% RAISE
            </div>

            <div style={{ fontSize: 22, fontWeight: 800, color: THEME.colors.textSecondary, letterSpacing: 1.5 }}>
              MONTHLY INCOME
            </div>
            <div style={{ fontFamily: THEME.typography.fontSerif, fontSize: 66, fontWeight: 900, color: THEME.colors.textPrimary, marginTop: 8 }}>
              ₹40,000
            </div>

            <div
              style={{
                marginTop: 65,
                padding: '8px 24px',
                borderRadius: 18,
                backgroundColor: 'rgba(158, 42, 43, 0.12)',
                border: '1.5px solid rgba(158, 42, 43, 0.3)',
                fontSize: 20,
                fontWeight: 800,
                color: THEME.colors.accentCrimson,
              }}
            >
              Zero Extra Saved
            </div>
          </div>

          {/* Ground Contact Shadow */}
          <div
            style={{
              width: 350,
              height: 28,
              borderRadius: '50%',
              backgroundColor: THEME.colors.shadowContact,
              filter: 'blur(10px)',
              marginTop: -14,
            }}
          />
        </div>
      </div>
    </div>
  );
};
