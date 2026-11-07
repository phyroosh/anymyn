import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from './theme';
import { GroceryBasketProp } from './components/GroceryBasketProp';

export const Shot2WhatItBuysV5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const sceneEntrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 80 },
  });

  // Camera slow push-in
  const cameraScale = interpolate(frame, [0, 300], [0.96, 1.04], {
    extrapolateRight: 'clamp',
  });

  // Scene exit fade
  const sceneOpacity = interpolate(frame, [280, 300], [1, 0], {
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
          top: THEME.layout.safeArea.top + 50,
          left: THEME.layout.safeArea.left,
          right: THEME.layout.safeArea.right,
          textAlign: 'center',
          zIndex: 30,
        }}
      >
        <div
          style={{
            ...THEME.typography.heroHeadline,
            color: THEME.colors.textPrimary,
            opacity: sceneEntrance,
            transform: `translateY(${(1 - sceneEntrance) * 30}px)`,
            textTransform: 'uppercase',
          }}
        >
          Today, It Buys This.
        </div>
      </div>

      {/* Central Visual Focus: The Physical Grocery Basket (100% full) */}
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
          transform: `scale(${sceneEntrance * cameraScale})`,
          zIndex: 20,
        }}
      >
        <GroceryBasketProp fillPercent={100} scale={1.05} />

        {/* Physical Engraved Plinth Base Label (No generic dashboard cards) */}
        <div
          style={{
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '12px 32px',
            borderRadius: 16,
            background: 'linear-gradient(180deg, #FFFFFF 0%, #EDE7D8 100%)',
            border: '2px solid #8F8772',
            boxShadow: `0 15px 30px ${THEME.colors.shadowContact}`,
          }}
        >
          <span style={{ fontSize: 34, fontWeight: 900, color: THEME.colors.textPrimary, fontFamily: 'serif' }}>
            $100
          </span>
          <span style={{ fontSize: 26, color: THEME.colors.textSecondary }}>➔</span>
          <span style={{ fontSize: 26, fontWeight: 800, color: THEME.colors.accentEmerald, letterSpacing: 1.5 }}>
            100% OF THIS BASKET
          </span>
        </div>
      </div>
    </div>
  );
};
