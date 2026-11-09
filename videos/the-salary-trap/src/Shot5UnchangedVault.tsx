import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from './theme';

export const Shot5UnchangedVault: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeSpring = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 90 } });
  const headlineSpring = spring({ frame: frame - 10, fps, config: { damping: 15, stiffness: 85 } });

  // Columns entrance
  const columnsSpring = spring({ frame: frame - 16, fps, config: { damping: 14, stiffness: 80 } });

  // Climax reveal at frame 85 (approx t = 36.8s on "thirty-seven thousand rupees... And your savings?")
  const climaxSpring = spring({ frame: frame - 85, fps, config: { damping: 12, stiffness: 85 } });

  const scale = interpolate(frame, [0, 240], [0.98, 1.025], { extrapolateRight: 'clamp' });
  const cameraY = interpolate(frame, [0, 240], [0, -10], { extrapolateRight: 'clamp' });

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
          backgroundColor: 'rgba(158, 42, 43, 0.12)',
          border: '1.5px solid rgba(158, 42, 43, 0.35)',
          color: THEME.colors.accentCrimson,
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: 2.5,
          textTransform: 'uppercase',
          marginBottom: 16,
        }}
      >
        Month-End Reality
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
          maxWidth: 920,
          lineHeight: 1.15,
          margin: '0 0 30px 0',
        }}
      >
        Total Spending: ₹37,000
      </h1>

      {/* 3. Stage: Side-by-Side Reality Check Grounded on Floor */}
      <div
        style={{
          position: 'relative',
          width: 960,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          opacity: columnsSpring,
          transform: `translateY(${(1 - columnsSpring) * 60}px)`,
          marginBottom: 35,
        }}
      >
        {/* LEFT CARD: SPENDING OVERFLOW (₹37,000) */}
        <div
          style={{
            width: 450,
            height: 520,
            borderRadius: 24,
            background: 'linear-gradient(180deg, #FAF7F0 0%, #EDE4D6 100%)',
            border: `3px solid ${THEME.colors.accentCrimson}`,
            boxShadow: '0 24px 55px rgba(158, 42, 43, 0.22)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '44px 32px',
            position: 'relative',
          }}
        >
          <div
            style={{
              padding: '8px 22px',
              borderRadius: 16,
              backgroundColor: 'rgba(158, 42, 43, 0.12)',
              fontSize: 20,
              fontWeight: 800,
              color: THEME.colors.accentCrimson,
              letterSpacing: 1.5,
            }}
          >
            NEW SPENDING
          </div>

          <div
            style={{
              fontFamily: THEME.typography.fontSerif,
              fontSize: 74,
              fontWeight: 900,
              color: THEME.colors.accentCrimson,
            }}
          >
            ₹37,000
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: THEME.colors.textPrimary }}>
              92.5% of Income Absorbed
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, color: THEME.colors.textSecondary, marginTop: 4 }}>
              +₹10,000 in lifestyle upgrades
            </div>
          </div>
        </div>

        {/* RIGHT CARD: UNCHANGED SAVINGS VAULT (₹3,000) */}
        <div
          style={{
            width: 450,
            height: 520,
            borderRadius: 24,
            background: 'linear-gradient(180deg, #FAF7F0 0%, #EDE4D6 100%)',
            border: `3px solid ${THEME.colors.accentGold}`,
            boxShadow: '0 24px 55px rgba(197, 138, 53, 0.22)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '44px 32px',
            position: 'relative',
          }}
        >
          <div
            style={{
              padding: '8px 22px',
              borderRadius: 16,
              backgroundColor: 'rgba(197, 138, 53, 0.12)',
              fontSize: 20,
              fontWeight: 800,
              color: THEME.colors.accentGold,
              letterSpacing: 1.5,
            }}
          >
            SAVINGS REMAINING
          </div>

          <div
            style={{
              fontFamily: THEME.typography.fontSerif,
              fontSize: 74,
              fontWeight: 900,
              color: THEME.colors.accentGold,
            }}
          >
            ₹3,000
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: THEME.colors.accentCrimson }}>
              Savings Rate: 7.5%
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, color: THEME.colors.textSecondary, marginTop: 4 }}>
              Dropped from 10.0% baseline
            </div>
          </div>
        </div>
      </div>

      {/* 4. CLIMAX REVEAL HERO BADGE: NET CHANGE = ₹0 */}
      <div
        style={{
          opacity: climaxSpring,
          transform: `translateY(${(1 - climaxSpring) * 35}px) scale(${0.9 + climaxSpring * 0.1})`,
          width: 900,
          backgroundColor: '#241F19',
          color: '#FAF7F0',
          padding: '24px 44px',
          borderRadius: 28,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          border: '2px solid rgba(255, 255, 255, 0.25)',
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 2, color: '#F87171' }}>
          EXTRA MONEY SAVED FROM THE RAISE:
        </div>
        <div style={{ fontFamily: THEME.typography.fontSerif, fontSize: 62, fontWeight: 900, color: '#FFFFFF' }}>
          EXACTLY ₹0
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, color: '#D1D5DB' }}>
          Earned ₹10,000 more every month. Saved ₹0 extra.
        </div>
      </div>
    </div>
  );
};
