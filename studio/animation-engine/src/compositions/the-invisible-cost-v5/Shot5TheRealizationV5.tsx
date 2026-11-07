import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from './theme';
import { GroceryBasketProp } from './components/GroceryBasketProp';
import { CHECKPOINTS } from './data/inflationData';

export const Shot5TheRealizationV5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const sceneEntrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 85 },
  });

  // Capacity transition from 100 down to 55.37% between frame 20 and 120
  const coverageProgress = interpolate(
    frame,
    [20, 120],
    [100, CHECKPOINTS.year20.purchasing_power], // 100 down to 55.37
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Scene exit fade out (frames 335 to 360)
  const sceneOpacity = interpolate(frame, [335, 360], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: THEME.layout.width,
        height: THEME.layout.height,
        position: 'relative',
        overflow: 'hidden',
        opacity: sceneOpacity,
        fontFamily: THEME.typography.fontSerif,
      }}
    >
      {/* Monumental Hero Headline — ONE SHOT. ONE IDEA. */}
      <div
        style={{
          position: 'absolute',
          top: THEME.layout.safeArea.top + 30,
          left: THEME.layout.safeArea.left,
          right: THEME.layout.safeArea.right,
          textAlign: 'center',
          zIndex: 30,
        }}
      >
        <div
          style={{
            ...THEME.typography.statement,
            color: THEME.colors.textPrimary,
            opacity: sceneEntrance,
            textTransform: 'uppercase',
          }}
        >
          Your $100
          <br />
          <span style={{ color: THEME.colors.accentEmerald }}>Now Buys About 55%.</span>
        </div>
      </div>

      {/* Central Visual Focus: The Exact Same Grocery Basket with Visibly Missing Items */}
      <div
        style={{
          position: 'absolute',
          top: 590,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${sceneEntrance})`,
          zIndex: 20,
        }}
      >
        {/* Physical Grocery Basket with reduced 55.4% contents */}
        <GroceryBasketProp fillPercent={coverageProgress} scale={1.05} />

        {/* Single Integrated Architectural Readout (No separate dashboard cards) */}
        <div
          style={{
            marginTop: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px 36px',
            borderRadius: 20,
            background: 'linear-gradient(180deg, #FFFFFF 0%, #EDE7D8 100%)',
            border: `2px solid ${THEME.colors.accentEmerald}`,
            boxShadow: `0 15px 35px ${THEME.colors.shadowContact}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: THEME.colors.textPrimary, fontFamily: 'serif' }}>
              $100 NOTE
            </span>
            <span style={{ fontSize: 24, color: THEME.colors.textSecondary }}>➔</span>
            <span style={{ fontSize: 32, fontWeight: 900, color: THEME.colors.accentEmerald, letterSpacing: 1 }}>
              {coverageProgress.toFixed(1)}% OF THE BASKET
            </span>
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 24,
              fontWeight: 700,
              color: THEME.colors.textSecondary,
              letterSpacing: 1,
            }}
          >
            ($55.37 PURCHASING VALUE)
          </div>
        </div>

        {/* Simple Conversational Takeaway */}
        <div
          style={{
            marginTop: 36,
            textAlign: 'center',
            fontSize: 32,
            fontWeight: 700,
            color: THEME.colors.textSecondary,
            lineHeight: 1.35,
          }}
        >
          Your money didn't disappear.
          <br />
          <span style={{ color: THEME.colors.accentAmber }}>It just buys less than before.</span>
        </div>
      </div>
    </div>
  );
};
