import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from './theme';

export const Shot6TheResolution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Monumental Verdict (Frames 0 - 90)
  const verdictSpring = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 85 } });
  
  // Phase 2: The 50/50 Solution Split (Frame 75 ~ t = 44.5s)
  const solutionSpring = spring({ frame: frame - 75, fps, config: { damping: 13, stiffness: 80 } });
  
  // Stamp entrance (Frame 160 ~ t = 47.3s)
  const stampSpring = spring({ frame: frame - 160, fps, config: { damping: 12, stiffness: 90 } });

  const scale = interpolate(frame, [0, 300], [0.98, 1.025], { extrapolateRight: 'clamp' });
  const cameraY = interpolate(frame, [0, 300], [0, -10], { extrapolateRight: 'clamp' });

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
        paddingTop: THEME.layout.safeArea.top - 30,
        fontFamily: THEME.typography.fontSans,
      }}
    >
      {/* 1. Monumental Verdict Statement */}
      <div
        style={{
          opacity: verdictSpring,
          transform: `translateY(${(1 - verdictSpring) * 25}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: 960,
          marginBottom: 35,
        }}
      >
        <div
          style={{
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
          The Core Realization
        </div>

        <h1
          style={{
            fontFamily: THEME.typography.fontSerif,
            fontSize: 74,
            fontWeight: 900,
            color: THEME.colors.textPrimary,
            lineHeight: 1.15,
            margin: '0 0 10px 0',
            letterSpacing: -1.0,
          }}
        >
          You didn't get richer.
        </h1>
        <h2
          style={{
            fontFamily: THEME.typography.fontSerif,
            fontSize: 56,
            fontWeight: 800,
            color: THEME.colors.accentCrimson,
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          Your life just got more expensive.
        </h2>
      </div>

      {/* 2. THE 50/50 RAISE BLUEPRINT GROUNDED ON FLOOR */}
      <div
        style={{
          opacity: solutionSpring,
          transform: `translateY(${(1 - solutionSpring) * 45}px)`,
          width: 960,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 30,
        }}
      >
        {/* Solution Subheader */}
        <div
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: THEME.colors.textSecondary,
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          The Solution: Save Half of Every Raise First
        </div>

        {/* Dual Split Cards (50% / 50%) */}
        <div
          style={{
            display: 'flex',
            gap: 30,
            width: '100%',
            justifyContent: 'center',
          }}
        >
          {/* LEFT: 50% TO SAVINGS */}
          <div
            style={{
              width: 450,
              height: 480,
              borderRadius: 24,
              background: 'linear-gradient(180deg, #FAF7F0 0%, #EDE4D6 100%)',
              border: `3px solid ${THEME.colors.accentEmerald}`,
              boxShadow: '0 20px 50px rgba(22, 132, 95, 0.22)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '40px 28px',
            }}
          >
            <div
              style={{
                backgroundColor: THEME.colors.accentEmerald,
                color: '#FFFFFF',
                padding: '8px 22px',
                borderRadius: 16,
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: 1.2,
              }}
            >
              1. AUTOMATE FIRST (50%)
            </div>

            <div style={{ fontFamily: THEME.typography.fontSerif, fontSize: 66, fontWeight: 900, color: THEME.colors.accentEmerald }}>
              +₹5,000
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: THEME.colors.textPrimary }}>
                New Savings: ₹8,000 / mo
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: THEME.colors.accentEmerald, marginTop: 6 }}>
                2.66× Baseline Savings!
              </div>
            </div>
          </div>

          {/* RIGHT: 50% TO LIFESTYLE UPGRADE */}
          <div
            style={{
              width: 450,
              height: 480,
              borderRadius: 24,
              background: 'linear-gradient(180deg, #FAF7F0 0%, #EDE4D6 100%)',
              border: `3px solid ${THEME.colors.accentGold}`,
              boxShadow: '0 20px 50px rgba(197, 138, 53, 0.22)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '40px 28px',
            }}
          >
            <div
              style={{
                backgroundColor: THEME.colors.accentGold,
                color: '#FFFFFF',
                padding: '8px 22px',
                borderRadius: 16,
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: 1.2,
              }}
            >
              2. UPGRADE FREELY (50%)
            </div>

            <div style={{ fontFamily: THEME.typography.fontSerif, fontSize: 66, fontWeight: 900, color: THEME.colors.accentGold }}>
              +₹5,000
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: THEME.colors.textPrimary }}>
                New Spending: ₹32,000 / mo
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: THEME.colors.accentGold, marginTop: 6 }}>
                Guilt-free lifestyle upgrades
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Gold Seal Stamp */}
      <div
        style={{
          opacity: stampSpring,
          transform: `scale(${stampSpring}) rotate(-2.5deg)`,
          backgroundColor: '#FAF7F0',
          border: `2.5px solid ${THEME.colors.accentGold}`,
          padding: '12px 38px',
          borderRadius: 28,
          boxShadow: '0 12px 30px rgba(197, 138, 53, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 30,
        }}
      >
        <span style={{ fontSize: 28 }}>✨</span>
        <span style={{ fontSize: 24, fontWeight: 800, color: THEME.colors.textPrimary, letterSpacing: 2 }}>
          SAVE THE RAISE FIRST
        </span>
      </div>

      {/* 4. Bottom Mobile Safe Zone Regulatory Disclaimer */}
      <div
        style={{
          position: 'absolute',
          bottom: THEME.layout.safeArea.bottom - 90,
          textAlign: 'center',
          maxWidth: 900,
          color: THEME.colors.textMuted,
          fontSize: THEME.typography.footnoteDisclaimer.fontSize,
          lineHeight: THEME.typography.footnoteDisclaimer.lineHeight,
        }}
      >
        Hypothetical educational illustration for financial literacy. Not personal financial or investment advice.
      </div>
    </div>
  );
};
