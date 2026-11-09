/**
 * ANYMYN Design Tokens — The Salary Trap
 * Signature Unified Ivory Grid Studio Palette & Typography Hierarchy
 */

export const THEME = {
  colors: {
    // Unified Ivory Grid Studio Environment
    bgWall: '#F3EFE5',
    bgWallIlluminated: '#FAF7F0',
    bgFloor: '#E9DFC9',
    bgFloorSubtle: '#F0ECE1',
    
    // Core Typography Colors
    textPrimary: '#241F19',
    textSecondary: '#756A5B',
    textMuted: '#9B9080',
    
    // Premium Accents
    accentGold: '#C58A35',
    accentGoldGlow: '#F59E0B',
    accentEmerald: '#16845F',
    accentEmeraldGlow: '#10B981',
    accentCrimson: '#9E2A2B',
    accentTerracotta: '#D97706',
    
    // Plinth & Material Colors
    plinthStone: '#EFEAE0',
    plinthBorder: 'rgba(117, 106, 91, 0.25)',
    taupeExpense: '#8C7E6C',
    taupeExpenseDark: '#6E6150',
    
    // Architectural Grid Lines
    gridLine: 'rgba(117, 106, 91, 0.09)',
    gridLineHorizon: 'rgba(117, 106, 91, 0.14)',
    
    // Shadows & Illumination
    shadowContact: 'rgba(80, 68, 52, 0.22)',
    shadowAmbient: 'rgba(50, 42, 30, 0.12)',
    glassVaultBorder: 'rgba(255, 255, 255, 0.65)',
    glassVaultBg: 'rgba(255, 255, 255, 0.35)',
  },
  
  typography: {
    fontSerif: '"Cinzel", "Playfair Display", "Times New Roman", serif',
    fontSans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontMono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    
    heroHeadline: {
      fontSize: 84,
      fontWeight: 800,
      lineHeight: 1.12,
      letterSpacing: -1.5,
    },
    statement: {
      fontSize: 74,
      fontWeight: 800,
      lineHeight: 1.16,
      letterSpacing: -1.0,
    },
    milestoneNumber: {
      fontSize: 108,
      fontWeight: 900,
      lineHeight: 1.0,
    },
    subphrase: {
      fontSize: 32,
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: 2,
    },
    badge: {
      fontSize: 26,
      fontWeight: 800,
      letterSpacing: 1.5,
    },
    footnoteDisclaimer: {
      fontSize: 22,
      fontWeight: 500,
      lineHeight: 1.45,
    },
  },
  
  layout: {
    width: 1080,
    height: 1920,
    fps: 30,
    safeArea: {
      top: 180,
      bottom: 160,
      left: 70,
      right: 70,
    },
    defaultHorizonY: 850,
  },
} as const;

export type Theme = typeof THEME;
