import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from './theme';

export const Shot2BaselineBudget: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeSpring = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 90 } });
  const headlineSpring = spring({ frame: frame - 10, fps, config: { damping: 15, stiffness: 85 } });
  
  // Column emergence
  const columnSpring = spring({ frame: frame - 16, fps, config: { damping: 14, stiffness: 75 } });
  
  // Breakdown items entrance
  const itemsSpring = spring({ frame: frame - 45, fps, config: { damping: 14, stiffness: 85 } });
  
  // Safety cushion vault activation at t ~ 5.5s into shot (frame ~165)
  const vaultSpring = spring({ frame: frame - 165, fps, config: { damping: 13, stiffness: 80 } });

  const scale = interpolate(frame, [0, 255], [0.98, 1.025], { extrapolateRight: 'clamp' });
  const cameraY = interpolate(frame, [0, 255], [0, -10], { extrapolateRight: 'clamp' });

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
          backgroundColor: 'rgba(117, 106, 91, 0.12)',
          border: '1.5px solid rgba(117, 106, 91, 0.3)',
          color: THEME.colors.textSecondary,
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: 2.5,
          textTransform: 'uppercase',
          marginBottom: 16,
        }}
      >
        Monthly Baseline
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
        The Starting Blueprint: ₹30,000
      </h1>

      {/* 3. Central Budget Pillar Construction Grounded on Floor */}
      <div
        style={{
          position: 'relative',
          width: 600,
          height: 1020,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 40,
          opacity: columnSpring,
          transform: `translateY(${(1 - columnSpring) * 80}px)`,
        }}
      >
        {/* TOP COMPONENT: The ₹3,000 Gold Savings Slab */}
        <div
          style={{
            width: 540,
            height: 160,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #FDE68A 0%, #D97706 50%, #92400E 100%)',
            border: '3px solid #FBBF24',
            boxShadow: '0 20px 45px rgba(217, 119, 6, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            position: 'relative',
            transform: `translateY(${(1 - vaultSpring) * 0 - vaultSpring * 15}px) scale(${1 + vaultSpring * 0.03})`,
          }}
        >
          {/* Guilloche border */}
          <div
            style={{
              position: 'absolute',
              inset: 6,
              borderRadius: 14,
              border: '1.5px dashed rgba(255, 255, 255, 0.6)',
              pointerEvents: 'none',
            }}
          />
          <div style={{ fontSize: 22, fontWeight: 800, color: '#FFFBEB', letterSpacing: 2 }}>
            SAVINGS (10% OF INCOME)
          </div>
          <div
            style={{
              fontFamily: THEME.typography.fontSerif,
              fontSize: 60,
              fontWeight: 900,
              color: '#FFFFFF',
              textShadow: '0 2px 8px rgba(146, 64, 14, 0.6)',
            }}
          >
            ₹3,000
          </div>
          
          {/* Safety Cushion Seal on activation */}
          <div
            style={{
              position: 'absolute',
              right: -24,
              top: -18,
              opacity: vaultSpring,
              transform: `scale(${vaultSpring}) rotate(-4deg)`,
              backgroundColor: THEME.colors.accentEmerald,
              color: '#FFFFFF',
              padding: '8px 20px',
              borderRadius: 18,
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: 1.2,
              boxShadow: '0 6px 18px rgba(22, 132, 95, 0.45)',
              border: '2.5px solid #FFFFFF',
            }}
          >
            ✓ SAFETY CUSHION
          </div>
        </div>

        {/* BOTTOM COMPONENT: The ₹27,000 Living Expenses Monolith (90%) */}
        <div
          style={{
            width: 560,
            height: 640,
            borderRadius: 24,
            background: 'linear-gradient(180deg, #F0EAE1 0%, #D8CEBE 100%)',
            border: `3px solid ${THEME.colors.plinthBorder}`,
            boxShadow: '0 28px 60px rgba(80, 68, 52, 0.24)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '40px 36px',
            position: 'relative',
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.colors.textSecondary, letterSpacing: 2 }}>
            LIVING EXPENSES (90%)
          </div>
          <div
            style={{
              fontFamily: THEME.typography.fontSerif,
              fontSize: 74,
              fontWeight: 900,
              color: THEME.colors.textPrimary,
              marginTop: 8,
              marginBottom: 40,
            }}
          >
            ₹27,000
          </div>

          {/* Detailed Relatable Expense Rows */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              opacity: itemsSpring,
              transform: `translateY(${(1 - itemsSpring) * 20}px)`,
            }}
          >
            {/* Rent */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.75)',
                padding: '16px 24px',
                borderRadius: 16,
                border: '1.5px solid rgba(117, 106, 91, 0.18)',
                boxShadow: '0 4px 12px rgba(80, 68, 52, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>🏠</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: THEME.colors.textPrimary }}>
                  Apartment Rent
                </span>
              </div>
              <span style={{ fontFamily: THEME.typography.fontMono, fontSize: 24, fontWeight: 800, color: THEME.colors.textSecondary }}>
                ₹15,000
              </span>
            </div>

            {/* Food & Groceries */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.75)',
                padding: '16px 24px',
                borderRadius: 16,
                border: '1.5px solid rgba(117, 106, 91, 0.18)',
                boxShadow: '0 4px 12px rgba(80, 68, 52, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>🛒</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: THEME.colors.textPrimary }}>
                  Groceries & Cooking
                </span>
              </div>
              <span style={{ fontFamily: THEME.typography.fontMono, fontSize: 24, fontWeight: 800, color: THEME.colors.textSecondary }}>
                ₹8,000
              </span>
            </div>

            {/* Commute / Transit */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.75)',
                padding: '16px 24px',
                borderRadius: 16,
                border: '1.5px solid rgba(117, 106, 91, 0.18)',
                boxShadow: '0 4px 12px rgba(80, 68, 52, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>🚇</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: THEME.colors.textPrimary }}>
                  Transit & Utilities
                </span>
              </div>
              <span style={{ fontFamily: THEME.typography.fontMono, fontSize: 24, fontWeight: 800, color: THEME.colors.textSecondary }}>
                ₹4,000
              </span>
            </div>
          </div>
        </div>

        {/* Contact Shadow Grounded on Floor */}
        <div
          style={{
            width: 540,
            height: 32,
            borderRadius: '50%',
            backgroundColor: THEME.colors.shadowContact,
            filter: 'blur(10px)',
            marginTop: -16,
          }}
        />
      </div>
    </div>
  );
};
