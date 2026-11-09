import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from './theme';

export const Shot4LifestyleCreep: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeSpring = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 90 } });
  const headlineSpring = spring({ frame: frame - 10, fps, config: { damping: 15, stiffness: 85 } });

  // Upgrade 1: Apartment (Frame 85 ~ t = 24.3s)
  const upgrade1Spring = spring({ frame: frame - 85, fps, config: { damping: 13, stiffness: 80 } });
  
  // Upgrade 2: Food & Delivery (Frame 190 ~ t = 27.8s)
  const upgrade2Spring = spring({ frame: frame - 190, fps, config: { damping: 13, stiffness: 80 } });
  
  // Upgrade 3: Smartphone EMI (Frame 275 ~ t = 30.6s)
  const upgrade3Spring = spring({ frame: frame - 275, fps, config: { damping: 13, stiffness: 80 } });

  // Dynamic calculation of total monthly spending
  const totalSpend = 27000 
    + (upgrade1Spring > 0.05 ? interpolate(upgrade1Spring, [0, 1], [0, 4000]) : 0)
    + (upgrade2Spring > 0.05 ? interpolate(upgrade2Spring, [0, 1], [0, 3000]) : 0)
    + (upgrade3Spring > 0.05 ? interpolate(upgrade3Spring, [0, 1], [0, 3000]) : 0);

  const scale = interpolate(frame, [0, 375], [0.98, 1.025], { extrapolateRight: 'clamp' });
  const cameraY = interpolate(frame, [0, 375], [0, -10], { extrapolateRight: 'clamp' });

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
        Behavioral Trap
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
          margin: '0 0 16px 0',
        }}
      >
        Lifestyle Creep Takes Over
      </h1>

      {/* Cumulative Spending Live Counter */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          backgroundColor: '#FAF7F0',
          padding: '12px 32px',
          borderRadius: 24,
          border: `2.5px solid ${THEME.colors.accentCrimson}`,
          boxShadow: '0 10px 25px rgba(158, 42, 43, 0.18)',
          marginBottom: 30,
        }}
      >
        <span style={{ fontSize: 22, fontWeight: 700, color: THEME.colors.textSecondary }}>
          TOTAL MONTHLY SPENDING:
        </span>
        <span style={{ fontFamily: THEME.typography.fontSerif, fontSize: 40, fontWeight: 900, color: THEME.colors.accentCrimson }}>
          ₹{Math.round(totalSpend).toLocaleString('en-IN')}
        </span>
      </div>

      {/* 3. Stage Container: The 3 Stacked Upgrade Modules Grounded on Floor */}
      <div
        style={{
          position: 'relative',
          width: 660,
          height: 980,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 16,
        }}
      >
        {/* UPGRADE 3: SMARTPHONE EMI (+₹3,000) */}
        <div
          style={{
            width: 600,
            height: 140,
            borderRadius: 20,
            backgroundColor: '#FAF7F0',
            border: '2px solid rgba(117, 106, 91, 0.35)',
            boxShadow: '0 14px 35px rgba(80, 68, 52, 0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            opacity: upgrade3Spring,
            transform: `translateY(${(1 - upgrade3Spring) * -45}px) scale(${0.92 + upgrade3Spring * 0.08})`,
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Phone Silhouette Icon */}
            <div
              style={{
                width: 48,
                height: 76,
                borderRadius: 10,
                backgroundColor: '#241F19',
                border: '2px solid #D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              }}
            >
              <div style={{ width: 16, height: 2, backgroundColor: '#756A5B', borderRadius: 2 }} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: THEME.colors.textPrimary }}>
                New Phone EMI
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, color: THEME.colors.textSecondary, marginTop: 2 }}>
                Flagship device upgrade "just a small monthly cost"
              </div>
            </div>
          </div>
          <div style={{ fontFamily: THEME.typography.fontSerif, fontSize: 44, fontWeight: 900, color: THEME.colors.accentCrimson }}>
            +₹3,000
          </div>
        </div>

        {/* UPGRADE 2: FOOD DELIVERY & DINING OUT (+₹3,000) */}
        <div
          style={{
            width: 600,
            height: 140,
            borderRadius: 20,
            backgroundColor: '#FAF7F0',
            border: '2px solid rgba(117, 106, 91, 0.35)',
            boxShadow: '0 14px 35px rgba(80, 68, 52, 0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            opacity: upgrade2Spring,
            transform: `translateY(${(1 - upgrade2Spring) * -45}px) scale(${0.92 + upgrade2Spring * 0.08})`,
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Dining Plate Icon */}
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: 'rgba(217, 119, 6, 0.15)',
                border: '2px solid #D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 30,
              }}
            >
              🍽️
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: THEME.colors.textPrimary }}>
                Ordering Food & Dinners
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, color: THEME.colors.textSecondary, marginTop: 2 }}>
                Frequent takeout apps and dining out
              </div>
            </div>
          </div>
          <div style={{ fontFamily: THEME.typography.fontSerif, fontSize: 44, fontWeight: 900, color: THEME.colors.accentCrimson }}>
            +₹3,000
          </div>
        </div>

        {/* UPGRADE 1: APARTMENT UPGRADE (+₹4,000) */}
        <div
          style={{
            width: 600,
            height: 140,
            borderRadius: 20,
            backgroundColor: '#FAF7F0',
            border: '2px solid rgba(117, 106, 91, 0.35)',
            boxShadow: '0 14px 35px rgba(80, 68, 52, 0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            opacity: upgrade1Spring,
            transform: `translateY(${(1 - upgrade1Spring) * -45}px) scale(${0.92 + upgrade1Spring * 0.08})`,
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Window Frame Icon */}
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 12,
                backgroundColor: 'rgba(197, 138, 53, 0.15)',
                border: '2px solid #C58A35',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 30,
              }}
            >
              🏢
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: THEME.colors.textPrimary }}>
                Nicer Apartment
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, color: THEME.colors.textSecondary, marginTop: 2 }}>
                Nicer location and higher monthly rent
              </div>
            </div>
          </div>
          <div style={{ fontFamily: THEME.typography.fontSerif, fontSize: 44, fontWeight: 900, color: THEME.colors.accentCrimson }}>
            +₹4,000
          </div>
        </div>

        {/* FOUNDATION EXPENSE BASE (₹27,000) */}
        <div
          style={{
            width: 600,
            height: 160,
            borderRadius: 22,
            background: 'linear-gradient(180deg, #F0EAE1 0%, #D8CEBE 100%)',
            border: `2.5px solid ${THEME.colors.plinthBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 36px',
            boxShadow: '0 16px 35px rgba(80, 68, 52, 0.15)',
            marginTop: 10,
          }}
        >
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: THEME.colors.textSecondary }}>
              BASELINE LIVING EXPENSES
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, color: THEME.colors.textMuted, marginTop: 4 }}>
              Original rent, groceries & transit
            </div>
          </div>
          <div style={{ fontFamily: THEME.typography.fontSerif, fontSize: 52, fontWeight: 900, color: THEME.colors.textPrimary }}>
            ₹27,000
          </div>
        </div>

        {/* Floor Contact Shadow */}
        <div
          style={{
            width: 580,
            height: 26,
            borderRadius: '50%',
            backgroundColor: THEME.colors.shadowContact,
            filter: 'blur(10px)',
            marginTop: -5,
          }}
        />
      </div>
    </div>
  );
};
