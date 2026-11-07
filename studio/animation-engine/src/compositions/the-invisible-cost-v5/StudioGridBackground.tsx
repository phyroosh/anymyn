import React from 'react';
import { THEME } from './theme';

export interface StudioGridBackgroundProps {
  cameraPanX?: number;
  cameraPanY?: number;
  lightFocusX?: number; // 0 to 100
  lightFocusY?: number; // 0 to 100
  horizonY?: number;
  gridOpacity?: number;
  contactShadow?: {
    x: number;
    y: number;
    rx: number;
    ry: number;
    opacity?: number;
  };
}

export const StudioGridBackground: React.FC<StudioGridBackgroundProps> = ({
  cameraPanX = 0,
  cameraPanY = 0,
  lightFocusX = 50,
  lightFocusY = 38,
  horizonY = THEME.layout.defaultHorizonY,
  gridOpacity = 1.0,
  contactShadow,
}) => {
  const width = THEME.layout.width;
  const height = THEME.layout.height;

  // Vanishing point on the horizon with subtle camera parallax
  const vanishingX = width / 2 + cameraPanX * 0.35;
  const currentHorizonY = horizonY + cameraPanY * 0.25;

  // Calculate perspective transversal floor lines (exponential compression toward horizon)
  const floorDepth = height - currentHorizonY;
  const numTransversals = 14;
  const transversalYPositions: number[] = [];
  for (let i = 1; i <= numTransversals; i++) {
    const t = i / numTransversals;
    // Quadratic perspective compression: lines spread wider near the camera (bottom)
    const y = currentHorizonY + floorDepth * Math.pow(t, 1.85);
    transversalYPositions.push(y);
  }

  // Calculate longitudinal lines radiating from vanishing point to bottom edge
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

  // Back wall architectural vertical lines
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
      {/* 1. Base Studio Wall Illumination (Soft Radial Light Source) */}
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
              rgba(243, 239, 229, 0) 0%,
              rgba(233, 223, 201, 0.45) 40%,
              rgba(224, 213, 190, 0.75) 100%)
          `,
        }}
      />

      {/* 3. Perspective Architectural Studio Grid (Layered with Edge Dissolve Mask) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: gridOpacity,
          maskImage: 'radial-gradient(ellipse at 50% 52%, black 25%, rgba(0,0,0,0.4) 60%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 52%, black 25%, rgba(0,0,0,0.4) 60%, transparent 80%)',
        }}
      >
        <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
          {/* Subtle Wall Vertical Mullion Lines */}
          {wallLines.map((x, idx) => (
            <line
              key={`wall-${idx}`}
              x1={x}
              y1={0}
              x2={x}
              y2={currentHorizonY}
              stroke={THEME.colors.gridLine}
              strokeWidth={1.0}
              strokeDasharray="4 8"
              opacity={0.65}
            />
          ))}

          {/* Horizon Line Divider */}
          <line
            x1={0}
            y1={currentHorizonY}
            x2={width}
            y2={currentHorizonY}
            stroke={THEME.colors.gridLineHorizon}
            strokeWidth={1.5}
            opacity={0.8}
          />

          {/* Perspective Floor Longitudinal Lines */}
          {longitudinalEnds.map((line, idx) => (
            <line
              key={`long-${idx}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={THEME.colors.gridLine}
              strokeWidth={idx % 2 === 0 ? 1.6 : 1.0}
            />
          ))}

          {/* Perspective Floor Transversal Lines */}
          {transversalYPositions.map((y, idx) => {
            const isMajor = idx % 3 === 0;
            return (
              <line
                key={`trans-${idx}`}
                x1={0}
                y1={y}
                x2={width}
                y2={y}
                stroke={isMajor ? THEME.colors.gridLineHorizon : THEME.colors.gridLine}
                strokeWidth={isMajor ? 1.5 : 1.0}
              />
            );
          })}
        </svg>
      </div>

      {/* 4. Natural Ambient Occlusion & Contact Shadow */}
      {contactShadow && (
        <div
          style={{
            position: 'absolute',
            left: contactShadow.x - contactShadow.rx,
            top: contactShadow.y - contactShadow.ry,
            width: contactShadow.rx * 2,
            height: contactShadow.ry * 2,
            borderRadius: '50%',
            background: THEME.colors.shadowContact,
            filter: 'blur(30px)',
            opacity: contactShadow.opacity ?? 1.0,
            transform: 'scaleY(0.45)',
          }}
        />
      )}
    </div>
  );
};
