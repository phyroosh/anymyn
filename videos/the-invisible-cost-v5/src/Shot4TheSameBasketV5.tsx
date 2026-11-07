import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from './theme';
import { GroceryBasketProp } from './components/GroceryBasketProp';
import { CHECKPOINTS } from './data/inflationData';

export const Shot4TheSameBasketV5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const sceneEntrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 80 },
  });

  // Price roll-up animation ($100.00 -> $180.61 between frame 30 and 180)
  const priceProgress = interpolate(frame, [30, 180], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const targetPrice = CHECKPOINTS.year20.basket_cost; // Exactly 180.61 from verified data
  const currentPrice = interpolate(priceProgress, [0, 1], [100.00, targetPrice]);

  // Subtle tag swing
  const tagSwing = interpolate(
    Math.sin((frame / 18) * Math.PI),
    [-1, 1],
    [-2.5, 2.5]
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
          top: THEME.layout.safeArea.top + 40,
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
          The Same Basket
          <br />
          <span style={{ color: THEME.colors.accentAmber }}>Now Costs More.</span>
        </div>
      </div>

      {/* Central Visual Focus: Exact Same Grocery Basket with Physical Price Tag */}
      <div
        style={{
          position: 'absolute',
          top: 600,
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
        <GroceryBasketProp
          fillPercent={100}
          scale={1.05}
          highlightPriceTag={`$${currentPrice.toFixed(2)}`}
          tagSwingAngle={tagSwing}
        />
      </div>
    </div>
  );
};
