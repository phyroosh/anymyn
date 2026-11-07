import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene2DifferentWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const sceneEntrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 80 },
  });

  // Environmental lighting shift (t = 14.0s to 17.0s / frames 105 to 195)
  const worldShift = interpolate(frame, [105, 195], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Basket price inflation factor (1.00 -> 1.806)
  const priceExpansion = interpolate(frame, [130, 260], [1.0, 1.806], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Real purchasing capacity shrinkage (100% -> 55.4%)
  const capacityCoverage = interpolate(frame, [140, 270], [100, 55.37], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scene exit fade
  const sceneOpacity = interpolate(frame, [380, 405], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Dynamic colors based on world shift
  const bgColor = interpolate(worldShift, [0, 1], [0, 1]);
  const textColor = worldShift > 0.5 ? '#F4F2EC' : '#141416';
  const subtitleColor = worldShift > 0.5 ? '#94A3B8' : '#575249';

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: worldShift > 0.5 ? '#0F131A' : '#EFEAE1',
        position: 'relative',
        overflow: 'hidden',
        opacity: sceneOpacity,
        fontFamily: '"Cinzel", "Playfair Display", "Times New Roman", serif',
        transition: 'background-color 0.8s ease',
      }}
    >
      {/* Background World Atmosphere */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            worldShift > 0.5
              ? 'radial-gradient(1000px circle at 50% 40%, rgba(30, 41, 59, 0.9) 0%, rgba(15, 19, 26, 1) 100%)'
              : 'radial-gradient(1000px circle at 50% 38%, rgba(255, 255, 255, 0.95) 0%, rgba(235, 228, 218, 0.85) 100%)',
        }}
      />

      {/* Hero Motion Typography */}
      <div
        style={{
          position: 'absolute',
          top: 210,
          left: 80,
          right: 80,
          textAlign: 'center',
          zIndex: 30,
        }}
      >
        <div
          style={{
            fontSize: 90,
            fontWeight: 800,
            lineHeight: 1.08,
            color: textColor,
            letterSpacing: -1.5,
            textTransform: 'uppercase',
            opacity: sceneEntrance,
          }}
        >
          The Same Bill.
          <br />
          <span style={{ color: worldShift > 0.5 ? '#38BDF8' : '#9E2A2B' }}>
            A Different World.
          </span>
        </div>

        <div
          style={{
            marginTop: 24,
            fontSize: 48,
            fontWeight: 700,
            color: subtitleColor,
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          {worldShift > 0.5 ? 'PRICES SURGE • PAPER REMAINS' : 'TODAY • EQUILIBRIUM'}
        </div>
      </div>

      {/* Main Vitrine & Basket Visualization */}
      <div
        style={{
          position: 'absolute',
          top: 660,
          left: 100,
          right: 100,
          height: 820,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
        }}
      >
        {/* Physical Glass Vitrine Container */}
        <div
          style={{
            width: 840,
            height: 520,
            borderRadius: 24,
            border: worldShift > 0.5 ? '3px solid rgba(56, 189, 248, 0.4)' : '3px solid #8F8772',
            background:
              worldShift > 0.5
                ? 'rgba(15, 23, 42, 0.75)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(240,235,225,0.5) 100%)',
            boxShadow:
              worldShift > 0.5
                ? '0 30px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(56, 189, 248, 0.15)'
                : '0 30px 60px -15px rgba(60, 50, 30, 0.25)',
            position: 'relative',
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Basket Header Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: worldShift > 0.5 ? '#38BDF8' : '#2D281E',
                letterSpacing: 2,
              }}
            >
              CONSUMER BASKET OF GOODS
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 900,
                color: worldShift > 0.5 ? '#F87171' : '#10B981',
                fontFamily: 'monospace',
              }}
            >
              ${(100 * priceExpansion).toFixed(2)}
            </div>
          </div>

          {/* Curated 3D Physical Goods Capsules */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              marginTop: 20,
              marginBottom: 20,
            }}
          >
            {/* Essential Groceries Module */}
            <div
              style={{
                width: 220,
                height: 220,
                borderRadius: 18,
                background: worldShift > 0.5 ? '#1E293B' : '#E2DCCD',
                border: worldShift > 0.5 ? '2px solid #334155' : '2px solid #B8AF99',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
              }}
            >
              <div style={{ fontSize: 52 }}>🥖</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: textColor, marginTop: 12 }}>FOOD & GOODS</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: worldShift > 0.5 ? '#F87171' : '#10B981', marginTop: 4 }}>
                ${(35 * priceExpansion).toFixed(1)}
              </div>
            </div>

            {/* Household Energy Module */}
            <div
              style={{
                width: 220,
                height: 220,
                borderRadius: 18,
                background: worldShift > 0.5 ? '#1E293B' : '#E2DCCD',
                border: worldShift > 0.5 ? '2px solid #334155' : '2px solid #B8AF99',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
              }}
            >
              <div style={{ fontSize: 52 }}>⚡</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: textColor, marginTop: 12 }}>ENERGY & POWER</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: worldShift > 0.5 ? '#F87171' : '#10B981', marginTop: 4 }}>
                ${(40 * priceExpansion).toFixed(1)}
              </div>
            </div>

            {/* Essential Transport/Services Module */}
            <div
              style={{
                width: 220,
                height: 220,
                borderRadius: 18,
                background: worldShift > 0.5 ? '#1E293B' : '#E2DCCD',
                border: worldShift > 0.5 ? '2px solid #334155' : '2px solid #B8AF99',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
              }}
            >
              <div style={{ fontSize: 52 }}>🚆</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: textColor, marginTop: 12 }}>MOBILITY & UTILITY</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: worldShift > 0.5 ? '#F87171' : '#10B981', marginTop: 4 }}>
                ${(25 * priceExpansion).toFixed(1)}
              </div>
            </div>
          </div>

          {/* Purchasing Capacity Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: textColor }}>
                $100 BANKNOTE PURCHASING COVERAGE
              </span>
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: capacityCoverage < 80 ? '#EF4444' : '#10B981',
                }}
              >
                {capacityCoverage.toFixed(1)}% OF FULL BASKET
              </span>
            </div>

            <div
              style={{
                width: '100%',
                height: 24,
                borderRadius: 12,
                backgroundColor: worldShift > 0.5 ? '#334155' : '#D1C9B6',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Active Purchasable Fill */}
              <div
                style={{
                  width: `${capacityCoverage}%`,
                  height: '100%',
                  background:
                    capacityCoverage < 80
                      ? 'linear-gradient(90deg, #10B981 0%, #F59E0B 60%, #EF4444 100%)'
                      : 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
                  borderRadius: 12,
                  transition: 'width 0.1s linear',
                }}
              />
            </div>
          </div>
        </div>

        {/* Central Identical $100 Banknote Plinth */}
        <div
          style={{
            marginTop: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '16px 42px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #DFDAC8 0%, #C8BFAB 100%)',
              border: '3px solid #8A816B',
              boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <span style={{ fontSize: 36, fontWeight: 900, color: '#1B1914' }}>$100.00 BANKNOTE</span>
            <span
              style={{
                padding: '6px 16px',
                borderRadius: 8,
                backgroundColor: '#1E293B',
                color: '#38BDF8',
                fontSize: 20,
                fontWeight: 800,
              }}
            >
              PHYSICALLY UNCHANGED
            </span>
          </div>

          <div
            style={{
              marginTop: 18,
              fontSize: 32,
              fontWeight: 700,
              color: worldShift > 0.5 ? '#F87171' : '#706A5F',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            {worldShift > 0.5
              ? 'Shortfall: Requires +$80.61 more to buy the same basket'
              : 'Initial State: 100% of basket acquired for $100'}
          </div>
        </div>
      </div>
    </div>
  );
};
