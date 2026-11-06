import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { evolvePath, getLength, getPointAtLength } from '@remotion/paths';
import curveData from '../../assets/compounding_data.json';

export const Scene4Surge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Curve progress surges from Year 15 (0.50) to Year 30 (1.0)
  const surgeProgress = interpolate(frame, [10, 140], [0.50, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const curveEvolved = useMemo(() => {
    return evolvePath(surgeProgress, curveData.paths.compound);
  }, [surgeProgress]);

  const totalLen = useMemo(() => {
    return getLength(curveData.paths.compound);
  }, []);

  const leadPoint = useMemo(() => {
    return getPointAtLength(curveData.paths.compound, surgeProgress * totalLen);
  }, [surgeProgress, totalLen]);

  // Live real-time compound calculation
  const currentYear = surgeProgress * 30;
  const currentVal = Math.round(10000 * Math.pow(1.10, currentYear));

  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 85 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#06080B',
        color: '#F4F2EC',
        fontFamily: "Cantarell, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Background vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 90% 70% at 50% 40%, rgba(16, 26, 38, 0.7) 0%, rgba(4, 6, 9, 0.98) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header Info */}
      <div
        style={{
          position: 'absolute',
          top: 180,
          left: 100,
          right: 100,
          opacity: enterSpring,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: '#8E8C85',
            fontFamily: "Inter, -apple-system, sans-serif",
            marginBottom: 12,
          }}
        >
          ANYMYN • CHAPTER IV
        </div>
        <h2
          style={{
            margin: 0,
            fontSize: 60,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#FFFFFF',
          }}
        >
          The Exponential Surge
        </h2>
        <p
          style={{
            margin: '8px 0 0 0',
            fontSize: 24,
            color: '#9CA3AF',
          }}
        >
          Year 20 → Year 30: When duration overpowers principal.
        </p>
      </div>

      {/* Live Giant Acceleration Counter */}
      <div
        style={{
          position: 'absolute',
          top: 340,
          left: 100,
          right: 100,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: 24,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#34D399',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontFamily: 'JetBrains Mono, monospace',
              marginBottom: 6,
            }}
          >
            Year {Math.round(currentYear)} Balance
          </div>
          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              color: '#10B981',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '-0.03em',
              lineHeight: 1.0,
            }}
          >
            ${currentVal.toLocaleString()}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#71717A',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: 'JetBrains Mono, monospace',
              marginBottom: 6,
            }}
          >
            Simple Baseline
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: '#71717A',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            $40,000
          </div>
        </div>
      </div>

      {/* Full Screen Dynamic SVG Chart */}
      <svg
        viewBox="0 0 1080 1920"
        style={{
          position: 'absolute',
          inset: 0,
          width: 1080,
          height: 1920,
          pointerEvents: 'none',
        }}
      >
        <defs>
          <linearGradient id="surgeAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
            <stop offset="70%" stopColor="#059669" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.0" />
          </linearGradient>

          <filter id="surgeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Horizontal gridlines */}
        {curveData.ticks_y.map((tick, idx) => (
          <g key={idx}>
            <line
              x1="130"
              y1={tick.y}
              x2="960"
              y2={tick.y}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="1.2"
            />
            <text
              x="110"
              y={tick.y + 6}
              fill="#6B7280"
              fontSize="18"
              fontWeight="500"
              fontFamily="JetBrains Mono, monospace"
              textAnchor="end"
            >
              {tick.val}
            </text>
          </g>
        ))}

        {/* Baseline Axis */}
        <line
          x1="130"
          y1="1380"
          x2="960"
          y2="1380"
          stroke="rgba(255, 255, 255, 0.16)"
          strokeWidth="1.8"
        />

        {/* Axis Years */}
        <text x="130" y="1425" fill="#8E8C85" fontSize="20" fontFamily="JetBrains Mono, monospace" textAnchor="middle">Year 0</text>
        <text x="406.67" y="1425" fill="#8E8C85" fontSize="20" fontFamily="JetBrains Mono, monospace" textAnchor="middle">Year 10</text>
        <text x="683.33" y="1425" fill="#8E8C85" fontSize="20" fontFamily="JetBrains Mono, monospace" textAnchor="middle">Year 20</text>
        <text x="960" y="1425" fill="#8E8C85" fontSize="20" fontFamily="JetBrains Mono, monospace" textAnchor="middle">Year 30</text>

        {/* Simple Interest Baseline Path */}
        <path
          d={curveData.paths.linear}
          fill="none"
          stroke="#71717A"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Shaded Area Under Compound Curve */}
        <path
          d={curveData.paths.compound_area}
          fill="url(#surgeAreaGrad)"
          opacity={interpolate(surgeProgress, [0.5, 0.8], [0.2, 1.0])}
        />

        {/* Compounding Rocket Curve */}
        <path
          d={curveData.paths.compound}
          strokeDasharray={curveEvolved.strokeDasharray}
          strokeDashoffset={curveEvolved.strokeDashoffset}
          fill="none"
          stroke="#10B981"
          strokeWidth="7"
          strokeLinecap="round"
          filter="url(#surgeGlow)"
        />

        {/* Glowing Rocket Tip Beacon */}
        {leadPoint && (
          <>
            <circle cx={leadPoint.x} cy={leadPoint.y} r="16" fill="#10B981" opacity={0.35} />
            <circle cx={leadPoint.x} cy={leadPoint.y} r="6.5" fill="#34D399" stroke="#FFFFFF" strokeWidth="2.5" />
          </>
        )}
      </svg>
    </AbsoluteFill>
  );
};
