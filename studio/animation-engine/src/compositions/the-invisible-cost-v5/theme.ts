/**
 * ANYMYN Design Tokens — Visual Identity V5.1
 * Authoritative single source of truth for colors, typography, spacing, and shadows.
 */

export const THEME = {
  colors: {
    // Permanent Light Environment Palette
    bgWall: '#F3EFE5',
    bgWallIlluminated: '#FAF7F0',
    bgFloor: '#E9DFC9',
    bgFloorSubtle: '#F0ECE1',
    
    // Typography Colors
    textPrimary: '#241F19',
    textSecondary: '#756A5B',
    textMuted: '#9B9080',
    
    // Signature Accents
    accentAmber: '#C58A35',
    accentAmberGlow: '#F59E0B',
    accentEmerald: '#16845F',
    accentCrimson: '#9E2A2B',
    
    // Architectural Grid Lines
    gridLine: 'rgba(117, 106, 91, 0.09)',
    gridLineHorizon: 'rgba(117, 106, 91, 0.14)',
    
    // Studio Ambient Shadows
    shadowContact: 'rgba(80, 68, 52, 0.22)',
    shadowAmbient: 'rgba(50, 42, 30, 0.12)',
  },
  
  typography: {
    fontSerif: '"Cinzel", "Playfair Display", "Times New Roman", serif',
    fontSans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontMono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    
    // Mobile Scale Hierarchy
    heroHeadline: {
      fontSize: 90,
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: -1.5,
    },
    statement: {
      fontSize: 78,
      fontWeight: 800,
      lineHeight: 1.14,
      letterSpacing: -1.0,
    },
    milestoneNumber: {
      fontSize: 116,
      fontWeight: 900,
      lineHeight: 1.0,
      fontFamily: 'serif',
    },
    subphrase: {
      fontSize: 32,
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: 2,
    },
    footnoteDisclaimer: {
      fontSize: 24,
      fontWeight: 500,
      lineHeight: 1.45,
    },
  },
  
  layout: {
    width: 1080,
    height: 1920,
    fps: 30,
    safeArea: {
      top: 200,
      bottom: 180,
      left: 80,
      right: 80,
    },
    defaultHorizonY: 840,
  },
} as const;

export type Theme = typeof THEME;
