import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from './theme';
import { BalanceScaleProp } from './components/BalanceScaleProp';

export const Shot3TimePassesV5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const sceneEntrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 85 },
  });

  // 20-year progression (frames 40 to 420)
  const timeProgress = interpolate(frame, [40, 420], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Current year counter (0 -> 20)
  const currentYear = Math.round(interpolate(timeProgress, [0, 1], [0, 20]));

  // Balance beam angle (0 deg -> 12 deg tilt to the right)
  const beamAngle = interpolate(timeProgress, [0, 1], [0, 12]);

  // Price mass scale (1.0x -> 1.55x)
  const rightMassScale = interpolate(timeProgress, [0, 1], [1.0, 1.55]);

  // Scene exit fade out (frames 480 to 510)
  const sceneOpacity = interpolate(frame, [480, 510], [1, 0], {
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
      {/* Hero Motion Headline — ONE SHOT. ONE IDEA. */}
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
          Prices Rise.
          <br />
          <span style={{ color: THEME.colors.accentAmber }}>The Bill Doesn't.</span>
        </div>

        {/* Dynamic Year Progress Tracker */}
        <div
          style={{
            marginTop: 24,
            display: 'inline-flex',
            alignItems: 'center',
            padding: '10px 32px',
            borderRadius: 24,
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            border: `2px solid ${THEME.colors.accentAmber}`,
            boxShadow: `0 8px 20px ${THEME.colors.shadowAmbient}`,
          }}
        >
          <span
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: THEME.colors.textPrimary,
              fontFamily: THEME.typography.fontMono,
              letterSpacing: 3,
            }}
          >
            YEAR {currentYear} OF 20
          </span>
        </div>
      </div>

      {/* Central Brass Balance Scale Assembly */}
      <div
        style={{
          position: 'absolute',
          top: 680,
          left: 60,
          right: 60,
          height: 800,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${sceneEntrance})`,
          zIndex: 20,
        }}
      >
        <BalanceScaleProp
          beamAngle={beamAngle}
          rightMassScale={rightMassScale}
          scale={0.98}
        />
      </div>
    </div>
  );
};
