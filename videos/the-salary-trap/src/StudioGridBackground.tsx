import React from 'react';
import { THEME } from './theme';

export interface StudioGridBackgroundProps {
  cameraPanX?: number;
  cameraPanY?: number;
  lightFocusX?: number;
  lightFocusY?: number;
  horizonY?: number;
  gridOpacity?: number;
}

export const StudioGridBackground: React.FC<StudioGridBackgroundProps> = ({
  cameraPanX = 0,
  cameraPanY = 0,
  lightFocusX = 50,
  lightFocusY = 38,
  horizonY = THEME.layout.defaultHorizonY,
  gridOpacity = 1.0,
}) => {
  const width = THEME.layout.width;
  const height = THEME.layout.height;

  const vanishingX = width / 2 + cameraPanX * 0.35;
  const currentHorizonY = horizonY + cameraPanY * 0.25;

  // Perspective transversal floor lines
  const floorDepth = height - currentHorizonY;
  const numTransversals = 14;
  const transversalYPositions: number[] = [];
  for (let i = 1; i <= numTransversals; i++) {
    const t = i / numTransversals;
    const y = currentHorizonY + floorDepth * Math.pow(t, 1.85);
    transversalYPositions.push(y);
  }

  // Perspective longitudinal lines
  const numLongitudinals = 16;
  const bottomSpread = width * 1.8;
  const longitudinalEnds: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i <= numLongitudinals; i++) {
    const t = i / numLongitudinals;
    const xBottom = -width * 0.4 + bottomSpread * t + cameraPanX;
    longitudinalEnds.push({
      x1: vanishingX,
      y1: currentHorizonY,
      x2: xBottom,
      y2: height + 50,
    });
  }

  // Wall vertical architectural lines
  const numWallLines = 10;
  const wallLines: number[] = [];
  for (let i = 0; i <= numWallLines; i++) {
    const x = (width / numWallLines) * i;
    wallLines.push(x);
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width,
        height,
        backgroundColor: THEME.colors.bgWall,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* 1. Base Studio Wall Illumination */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(1300px circle at ${lightFocusX}% ${lightFocusY}%,
              rgba(255, 252, 245, 0.98) 0%,
              rgba(243, 239, 229, 0.92) 50%,
              rgba(230, 222, 208, 0.85) 100%)
          `,
        }}
      />

      {/* 2. Soft Ambient Floor Warmth Gradient */}
      <div
        style={{
          position: 'absolute',
          top: currentHorizonY - 60,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            linear-gradient(180deg,
              transparent 0%,
              rgba(233, 223, 201, 0.35) 20%,
              rgba(224, 212, 187, 0.65) 60%,
              rgba(215, 201, 172, 0.90) 100%)
          `,
        }}
      />

      {/* 3. Architectural Floor Transversal Lines */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width,
          height,
          opacity: gridOpacity,
        }}
      >
        {transversalYPositions.map((y, index) => {
          const t = index / numTransversals;
          const strokeOpacity = 0.04 + 0.14 * Math.pow(t, 1.2);
          const strokeWidth = 1.0 + 1.4 * t;
          return (
            <line
              key={`transversal-${index}`}
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke="rgba(117, 106, 91, 1)"
              strokeOpacity={strokeOpacity}
              strokeWidth={strokeWidth}
            />
          );
        })}

        {/* 4. Perspective Longitudinal Lines */}
        {longitudinalEnds.map((line, index) => {
          return (
            <line
              key={`longitudinal-${index}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="rgba(117, 106, 91, 1)"
              strokeOpacity={0.09}
              strokeWidth={1.2}
            />
          );
        })}

        {/* 5. Horizon Seam */}
        <line
          x1={0}
          y1={currentHorizonY}
          x2={width}
          y2={currentHorizonY}
          stroke="rgba(117, 106, 91, 1)"
          strokeOpacity={0.16}
          strokeWidth={1.5}
        />

        {/* 6. Wall Subtle Vertical Architectural Grooves */}
        {wallLines.map((x, index) => (
          <line
            key={`wall-line-${index}`}
            x1={x}
            y1={0}
            x2={x}
            y2={currentHorizonY}
            stroke="rgba(117, 106, 91, 1)"
            strokeOpacity={0.035}
            strokeWidth={1.0}
          />
        ))}
      </svg>
    </div>
  );
};
