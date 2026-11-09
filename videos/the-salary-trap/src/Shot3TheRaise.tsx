import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from './theme';

export const Shot3TheRaise: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeSpring = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 90 } });
  const headlineSpring = spring({ frame: frame - 10, fps, config: { damping: 15, stiffness: 85 } });

  // Raise block impact descent at frame 35 (approx t = 15.2s)
  const raiseBlockSpring = spring({ frame: frame - 35, fps, config: { damping: 12, stiffness: 75 } });
  
  // Salary counter roll-up from 30,000 to 40,000
  const salaryProgress = interpolate(frame, [40, 90], [30000, 40000], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const currentSalaryFormatted = Math.round(salaryProgress).toLocaleString('en-IN');

  // Phantom savings tower surge at frame 125 (approx t = 18.2s on "shoot up")
  const phantomTowerSpring = spring({ frame: frame - 125, fps, config: { damping: 13, stiffness: 70 } });

  const scale = interpolate(frame, [0, 225], [0.98, 1.025], { extrapolateRight: 'clamp' });
  const cameraY = interpolate(frame, [0, 225], [0, -10], { extrapolateRight: 'clamp' });

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
          backgroundColor: 'rgba(217, 119, 6, 0.12)',
          border: '1.5px solid rgba(217, 119, 6, 0.35)',
          color: THEME.colors.accentTerracotta,
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: 2.5,
          textTransform: 'uppercase',
          marginBottom: 16,
        }}
      >
        Promotion & Pay Raise
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
          margin: '0 0 24px 0',
        }}
      >
        Salary Jumps to ₹{currentSalaryFormatted}
      </h1>

      {/* 3. Stage Container Grounded on Perspective Floor */}
      <div
        style={{
          position: 'relative',
          width: 620,
          height: 1020,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 40,
        }}
      >
        {/* PHANTOM SAVINGS SURGE TOWER (The Expectation Loop) */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            width: 540,
            height: 240,
            borderRadius: 22,
            border: '3px dashed rgba(217, 119, 6, 0.85)',
            backgroundColor: 'rgba(254, 243, 199, 0.55)',
            boxShadow: '0 0 45px rgba(245, 158, 11, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: phantomTowerSpring,
            transform: `translateY(${(1 - phantomTowerSpring) * 35}px) scale(${0.9 + phantomTowerSpring * 0.1})`,
            backdropFilter: 'blur(8px)',
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 800, color: THEME.colors.accentTerracotta, letterSpacing: 2 }}>
            THE INTUITIVE EXPECTATION
          </div>
          <div
            style={{
              fontFamily: THEME.typography.fontSerif,
              fontSize: 64,
              fontWeight: 900,
              color: THEME.colors.accentGold,
              marginTop: 4,
            }}
          >
            ₹13,000
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: THEME.colors.accentEmerald, marginTop: 4 }}>
            +333% SAVINGS SURGE EXPECTED
          </div>
        </div>

        {/* DESCENDING GOLDEN RAISE SLAB (+₹10,000) */}
        <div
          style={{
            width: 550,
            height: 160,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #FEF08A 0%, #EAB308 50%, #A16207 100%)',
            border: '3px solid #FACC15',
            boxShadow: '0 24px 50px rgba(202, 138, 4, 0.45)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 18,
            position: 'relative',
            opacity: raiseBlockSpring,
            transform: `translateY(${(1 - raiseBlockSpring) * -200}px)`,
            zIndex: 5,
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 900, color: '#FFFFFF', letterSpacing: 2, textShadow: '0 2px 4px rgba(113, 63, 18, 0.6)' }}>
            NEW INCOME ADDED
          </div>
          <div
            style={{
              fontFamily: THEME.typography.fontSerif,
              fontSize: 60,
              fontWeight: 900,
              color: '#FFFFFF',
              textShadow: '0 2px 8px rgba(113, 63, 18, 0.8)',
            }}
          >
            +₹10,000 / mo
          </div>
          <div
            style={{
              position: 'absolute',
              right: 20,
              top: 16,
              padding: '6px 14px',
              borderRadius: 14,
              backgroundColor: 'rgba(0, 0, 0, 0.22)',
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: 800,
            }}
          >
            +33.3% RAISE
          </div>
        </div>

        {/* EXISTING SAVINGS BASE SLAB (₹3,000) */}
        <div
          style={{
            width: 540,
            height: 120,
            borderRadius: 18,
            background: 'linear-gradient(135deg, #FDE68A 0%, #D97706 100%)',
            border: '2.5px solid #FBBF24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 36px',
            marginBottom: 18,
            boxShadow: '0 12px 28px rgba(217, 119, 6, 0.25)',
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 800, color: '#FFFBEB', letterSpacing: 1.5 }}>
            ORIGINAL SAVINGS
          </span>
          <span style={{ fontFamily: THEME.typography.fontSerif, fontSize: 48, fontWeight: 900, color: '#FFFFFF' }}>
            ₹3,000
          </span>
        </div>

        {/* LIVING EXPENSES BLOCK (₹27,000) */}
        <div
          style={{
            width: 560,
            height: 440,
            borderRadius: 24,
            background: 'linear-gradient(180deg, #F0EAE1 0%, #D8CEBE 100%)',
            border: `3px solid ${THEME.colors.plinthBorder}`,
            boxShadow: '0 24px 50px rgba(80, 68, 52, 0.22)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.colors.textSecondary, letterSpacing: 2 }}>
            LIVING EXPENSES (90%)
          </div>
          <div
            style={{
              fontFamily: THEME.typography.fontSerif,
              fontSize: 68,
              fontWeight: 900,
              color: THEME.colors.textPrimary,
              marginTop: 8,
            }}
          >
            ₹27,000
          </div>
        </div>

        {/* Ground Contact Shadow */}
        <div
          style={{
            width: 540,
            height: 30,
            borderRadius: '50%',
            backgroundColor: THEME.colors.shadowContact,
            filter: 'blur(10px)',
            marginTop: -15,
          }}
        />
      </div>
    </div>
  );
};
