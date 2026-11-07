import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from './theme';
import { BanknoteProp } from './components/BanknoteProp';

export const Shot1TheMoneyV5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const introSpring = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 70, mass: 1.1 },
  });

  // Slow, cinematic macro camera push-in
  const cameraScale = interpolate(frame, [0, 240], [0.95, 1.05], {
    extrapolateRight: 'clamp',
  });
  const cameraPanY = interpolate(frame, [0, 240], [15, -10], {
    extrapolateRight: 'clamp',
  });
  const cameraRotateX = interpolate(frame, [0, 240], [16, 9], {
    extrapolateRight: 'clamp',
  });
  const cameraRotateY = interpolate(frame, [0, 240], [-10, -3], {
    extrapolateRight: 'clamp',
  });

  // Specular light sweep across banknote face (frames 20 to 90)
  const sheenProgress = interpolate(frame, [20, 90], [-180, 260], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Caustic starburst flare at t = 2.0s (frame 60)
  const flareIntensity = interpolate(
    frame,
    [52, 60, 78],
    [0, 1.0, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Fade out transition at the end of scene (frames 220 to 240)
  const sceneOpacity = interpolate(frame, [220, 240], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Hero headline entrance
  const titleSpring = spring({
    frame: frame - 12,
    fps,
    config: { damping: 16, stiffness: 90 },
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
          zIndex: 30,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            ...THEME.typography.heroHeadline,
            color: THEME.colors.textPrimary,
            opacity: titleSpring,
            transform: `translateY(${(1 - titleSpring) * 35}px)`,
            textTransform: 'uppercase',
          }}
        >
          This Is $100.
        </div>
      </div>

      {/* Hero 3D Banknote Prop */}
      <div
        style={{
          position: 'absolute',
          top: 730,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 20,
        }}
      >
        <BanknoteProp
          scale={introSpring * cameraScale}
          panY={cameraPanY}
          rotateX={cameraRotateX}
          rotateY={cameraRotateY}
          sheenProgress={sheenProgress}
          flareIntensity={flareIntensity}
        />
      </div>
    </div>
  );
};
