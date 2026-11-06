import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  staticFile,
} from 'remotion';
import { evolvePath, getLength, getPointAtLength } from '@remotion/paths';
import curveData from '../assets/compounding_data.json';

export const CompoundingProof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // =========================================================================
  // 1. TIMING & CHOREOGRAPHY (Synchronized with Christopher neural voice)
  // =========================================================================
  
  // Zone A: Headline Fade-in (0.0s - 0.8s: frames 0 - 24)
  const headlineOpacity = interpolate(frame, [0, 22], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const headlineY = interpolate(frame, [0, 22], [16, 0], {
    extrapolateRight: 'clamp',
  });

  // Zone B: Grid & Frame Entrance (0.4s - 1.2s: frames 12 - 36)
  const gridOpacity = interpolate(frame, [12, 36], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Beat 1 (1.0s - 3.2s: frames 30 - 95): "Linear effort yields linear results."
  const simpleProgress = interpolate(frame, [30, 95], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Beat 2 (3.2s - 7.0s: frames 95 - 210):
  // "But compound growth? It starts quietly... and then changes everything."
  const compoundProgress = interpolate(frame, [95, 210], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Beat 3 (7.2s - 9.33s: frames 215 - 280): Final Reveal lock-in
  const finalRevealSpring = spring({
    frame: frame - 212,
    fps,
    config: { damping: 16, stiffness: 85 },
  });

  // =========================================================================
  // 2. MATHEMATICAL PATHS & COORDINATES (from verified JSON)
  // =========================================================================
  const simpleEvolved = useMemo(() => {
    return evolvePath(simpleProgress, curveData.paths.linear);
  }, [simpleProgress]);

  const compoundEvolved = useMemo(() => {
    return evolvePath(compoundProgress, curveData.paths.compound);
  }, [compoundProgress]);

  const compoundTotalLen = useMemo(() => {
    return getLength(curveData.paths.compound);
  }, []);

  const simpleTotalLen = useMemo(() => {
    return getLength(curveData.paths.linear);
  }, []);

  // Current tip positions
  const simpleLeadPoint = useMemo(() => {
    if (simpleProgress <= 0.001) return { x: 130, y: 1380 };
    return getPointAtLength(curveData.paths.linear, simpleProgress * simpleTotalLen);
  }, [simpleProgress, simpleTotalLen]);

  const compoundLeadPoint = useMemo(() => {
    if (compoundProgress <= 0.001) return { x: 130, y: 1380 };
    return getPointAtLength(curveData.paths.compound, compoundProgress * compoundTotalLen);
  }, [compoundProgress, compoundTotalLen]);

  // Current verified numerical values (Strict math: P*(1+0.10*t) and P*(1.10)^t)
  const simpleCurrentYear = simpleProgress * 30;
  const simpleCurrentVal = Math.round(10000 * (1.0 + 0.10 * simpleCurrentYear));

  const compoundCurrentYear = compoundProgress * 30;
  const compoundCurrentVal = Math.round(10000 * Math.pow(1.10, compoundCurrentYear));

  // Inflection marker (Year 15: t=15, x=545, compound reaches ~$41.7k)
  const showInflection = compoundProgress >= 0.50;
  const inflectionOpacity = interpolate(compoundProgress, [0.48, 0.58], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#090B0E',
        color: '#F4F2EC',
        fontFamily: "Cantarell, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Voiceover Track */}
      <Audio src={staticFile('audio/narration.mp3')} volume={1.25} />

      {/* Atmospheric Subtle Film Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 90% 70% at 50% 46%, rgba(18, 25, 36, 0.75) 0%, rgba(5, 7, 10, 0.98) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* =================================================================== */}
      {/* ZONE A: EDITORIAL HEADLINE (Top: y = 160 to 360)                   */}
      {/* =================================================================== */}
      <div
        style={{
          position: 'absolute',
          top: 160,
          left: 100,
          right: 100,
          opacity: headlineOpacity,
          transform: `translateY(${headlineY}px)`,
        }}
      >
        {/* Subtle, unpretentious editorial masthead */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 22,
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#8E8C85',
              fontFamily: "Inter, -apple-system, sans-serif",
            }}
          >
            ANYMYN EDITORIAL
          </span>
          <div
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: '#52525B',
            }}
          />
          <span
            style={{
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: '0.08em',
              color: '#6B7280',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            FIG. 01 • COMPOUNDING DYNAMICS
          </span>
        </div>

        {/* Headline: Clean, authoritative, warm ivory */}
        <h1
          style={{
            margin: 0,
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.035em',
            color: '#F4F2EC',
          }}
        >
          THE POWER OF<br />
          <span style={{ color: '#10B981' }}>COMPOUNDING</span>
        </h1>

        {/* Supporting brief line */}
        <p
          style={{
            margin: '16px 0 0 0',
            fontSize: 27,
            fontWeight: 400,
            color: '#9CA3AF',
            letterSpacing: '-0.01em',
          }}
        >
          $10,000 initial principal. 10% annual growth. 30 years.
        </p>
      </div>

      {/* =================================================================== */}
      {/* ZONE B: CENTERPIECE VISUALIZATION (y = 480 to 1420)                */}
      {/* =================================================================== */}
      <svg
        viewBox="0 0 1080 1920"
        style={{
          position: 'absolute',
          inset: 0,
          width: 1080,
          height: 1920,
          opacity: gridOpacity,
          pointerEvents: 'none',
        }}
      >
        <defs>
          {/* Restrained emerald area gradient */}
          <linearGradient id="editorialAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.16" />
            <stop offset="60%" stopColor="#059669" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.0" />
          </linearGradient>

          {/* Gentle, cinematic soft glow (subtle, non-neon) */}
          <filter id="cinematicGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- Minimal Horizontal Gridlines --- */}
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
              fontSize="19"
              fontWeight="500"
              fontFamily="JetBrains Mono, monospace"
              textAnchor="end"
            >
              {tick.val}
            </text>
          </g>
        ))}

        {/* --- Year Markers on Horizontal Axis --- */}
        <line
          x1="130"
          y1="1380"
          x2="960"
          y2="1380"
          stroke="rgba(255, 255, 255, 0.16)"
          strokeWidth="1.8"
        />

        <text
          x="130"
          y="1425"
          fill="#8E8C85"
          fontSize="20"
          fontWeight="500"
          fontFamily="JetBrains Mono, monospace"
          textAnchor="middle"
        >
          Year 0
        </text>
        <text
          x="406.67"
          y="1425"
          fill="#8E8C85"
          fontSize="20"
          fontWeight="500"
          fontFamily="JetBrains Mono, monospace"
          textAnchor="middle"
        >
          Year 10
        </text>
        <text
          x="683.33"
          y="1425"
          fill="#8E8C85"
          fontSize="20"
          fontWeight="500"
          fontFamily="JetBrains Mono, monospace"
          textAnchor="middle"
        >
          Year 20
        </text>
        <text
          x="960"
          y="1425"
          fill="#8E8C85"
          fontSize="20"
          fontWeight="500"
          fontFamily="JetBrains Mono, monospace"
          textAnchor="middle"
        >
          Year 30
        </text>

        {/* --- Shaded Area under Compound Curve --- */}
        {compoundProgress > 0.05 && (
          <path
            d={curveData.paths.compound_area}
            fill="url(#editorialAreaGrad)"
            opacity={compoundProgress}
          />
        )}

        {/* --- Curve 1: Simple Interest (Straight Line, Muted Stone) --- */}
        <path
          d={curveData.paths.linear}
          strokeDasharray={simpleEvolved.strokeDasharray}
          strokeDashoffset={simpleEvolved.strokeDashoffset}
          fill="none"
          stroke="#71717A"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Live Tracking Label for Simple Interest during its draw */}
        {simpleLeadPoint && simpleProgress > 0.08 && (
          <g>
            <circle
              cx={simpleLeadPoint.x}
              cy={simpleLeadPoint.y}
              r="4.5"
              fill="#A1A1AA"
            />
            {simpleProgress < 0.95 && (
              <text
                x={simpleLeadPoint.x + 12}
                y={simpleLeadPoint.y - 12}
                fill="#94A3B8"
                fontSize="18"
                fontWeight="500"
                fontFamily="JetBrains Mono, monospace"
              >
                ${simpleCurrentVal.toLocaleString()}
              </text>
            )}
          </g>
        )}

        {/* Permanent endpoint indicator for Simple Interest */}
        {simpleProgress >= 0.95 && (
          <g>
            <circle cx="960" cy="1234.3" r="5" fill="#71717A" />
            <text
              x="960"
              y="1275"
              fill="#71717A"
              fontSize="20"
              fontWeight="600"
              fontFamily="JetBrains Mono, monospace"
              textAnchor="end"
            >
              Simple: $40,000
            </text>
          </g>
        )}

        {/* --- Curve 2: Compound Interest (Exponential Curve, Rich Emerald) --- */}
        <path
          d={curveData.paths.compound}
          strokeDasharray={compoundEvolved.strokeDasharray}
          strokeDashoffset={compoundEvolved.strokeDashoffset}
          fill="none"
          stroke="#10B981"
          strokeWidth="6"
          strokeLinecap="round"
          filter="url(#cinematicGlow)"
        />

        {/* Leading Beacon for Compound Curve */}
        {compoundLeadPoint && compoundProgress > 0.02 && (
          <g>
            <circle
              cx={compoundLeadPoint.x}
              cy={compoundLeadPoint.y}
              r="12"
              fill="#10B981"
              opacity={0.3}
            />
            <circle
              cx={compoundLeadPoint.x}
              cy={compoundLeadPoint.y}
              r="5.5"
              fill="#34D399"
              stroke="#F4F2EC"
              strokeWidth="2"
            />
            {/* Live Floating Counter moving directly with curve */}
            {compoundProgress < 0.95 && (
              <g>
                <text
                  x={compoundLeadPoint.x}
                  y={compoundLeadPoint.y - 24}
                  fill="#10B981"
                  fontSize="24"
                  fontWeight="700"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor={compoundProgress > 0.75 ? 'end' : 'start'}
                >
                  ${compoundCurrentVal.toLocaleString()}
                </text>
              </g>
            )}
          </g>
        )}

        {/* Year 15 Subtle Inflection Point Guideline */}
        {showInflection && (
          <g opacity={inflectionOpacity}>
            <line
              x1="545"
              y1="1380"
              x2="545"
              y2="1080"
              stroke="rgba(245, 158, 11, 0.4)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <circle cx="545" cy="1225.8" r="5" fill="#F59E0B" />
            <text
              x="545"
              y="1055"
              fill="#FBBF24"
              fontSize="16"
              fontWeight="600"
              letterSpacing="0.05em"
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
            >
              YEAR 15 INFLECTION
            </text>
            <text
              x="545"
              y="1080"
              fill="#9CA3AF"
              fontSize="15"
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
            >
              $41,772 vs $25,000
            </text>
          </g>
        )}

        {/* Terminal Peak Indicator ($174,494) directly on chart */}
        {compoundProgress >= 0.95 && (
          <g opacity={finalRevealSpring}>
            <circle cx="960" cy="580" r="7" fill="#10B981" />
            <text
              x="960"
              y="535"
              fill="#10B981"
              fontSize="38"
              fontWeight="800"
              fontFamily="JetBrains Mono, monospace"
              textAnchor="end"
            >
              $174,494
            </text>
            <text
              x="960"
              y="498"
              fill="#34D399"
              fontSize="18"
              fontWeight="600"
              letterSpacing="0.08em"
              style={{ textTransform: 'uppercase' }}
              fontFamily="JetBrains Mono, monospace"
              textAnchor="end"
            >
              Compound Balance
            </text>
          </g>
        )}
      </svg>

      {/* =================================================================== */}
      {/* ZONE C: FINAL FINANCIAL REVEAL (Bottom: y = 1465 to 1720)          */}
      {/* =================================================================== */}
      <div
        style={{
          position: 'absolute',
          top: 1465,
          left: 100,
          right: 100,
          opacity: finalRevealSpring,
          transform: `translateY(${interpolate(finalRevealSpring, [0, 1], [18, 0])}px)`,
        }}
      >
        {/* Fine Editorial Divider */}
        <div
          style={{
            height: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            marginBottom: 26,
          }}
        />

        {/* Side-by-Side Clean Contrast (No rounded cards, pure typography) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 40,
          }}
        >
          {/* Simple Interest Column */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#71717A',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: 6,
              }}
            >
              Simple Interest
            </div>
            <div
              style={{
                fontSize: 44,
                fontWeight: 700,
                color: '#A1A1AA',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              $40,000
            </div>
            <div
              style={{
                fontSize: 18,
                color: '#71717A',
                marginTop: 6,
              }}
            >
              4.00× initial principal
            </div>
          </div>

          {/* Vertical Separator */}
          <div
            style={{
              width: 1,
              height: 92,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            }}
          />

          {/* Compound Interest Column (Strong visual emphasis) */}
          <div style={{ flex: 1.4 }}>
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
              Compound Interest
            </div>
            <div
              style={{
                fontSize: 58,
                fontWeight: 800,
                color: '#10B981',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
              }}
            >
              $174,494
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#F4F2EC',
                marginTop: 8,
              }}
            >
              <span style={{ color: '#F59E0B', fontWeight: 700 }}>4.36×</span> simple interest outcome
              <span style={{ color: '#71717A', margin: '0 8px' }}>•</span>
              <span style={{ color: '#9CA3AF' }}>17.45× capital</span>
            </div>
          </div>
        </div>

        {/* Editorial Footnote / Disclosure */}
        <div
          style={{
            marginTop: 32,
            fontSize: 16,
            color: '#71717A',
            fontFamily: "Inter, -apple-system, sans-serif",
            lineHeight: 1.45,
          }}
        >
          Simplified educational model. Assumes 10% annual compounding with all proceeds reinvested. Excludes fees, taxes, and inflation.
        </div>
      </div>
    </AbsoluteFill>
  );
};
