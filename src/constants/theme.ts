export interface ColorPalette {
  background: string;
  card: string;
  cardBorder: string;
  cardBorderTop: string;
  surface: string;
  glassPanel: string;
  glassPanelBorder: string;
  glassHover: string;
  text: string;
  textMuted: string;
  textDim: string;
  border: string;
  primary: string;
  primaryLight: string;
  accent2: string;
  accent3: string;
  glowPrimary: string;
  danger: string;
  dangerLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  badge: string;
  tabBarBg: string;
  dockActiveBg: string;
  dockActiveBorder: string;
}

export const lightColors: ColorPalette = {
  background: '#07080A', // Keep unified obsidian canvas for luxury aesthetic
  card: 'rgba(20, 23, 31, 0.82)',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  cardBorderTop: 'rgba(255, 255, 255, 0.18)',
  surface: 'rgba(255, 255, 255, 0.06)',
  glassPanel: 'rgba(18, 21, 28, 0.94)',
  glassPanelBorder: 'rgba(255, 255, 255, 0.12)',
  glassHover: 'rgba(255, 255, 255, 0.09)',
  text: '#FFFFFF',
  textMuted: '#9CA3AF',
  textDim: '#6B7280',
  border: 'rgba(255, 255, 255, 0.08)',
  primary: '#FACC15', // Solar Gold / Electric Amber (Mobbin Box Box style)
  primaryLight: 'rgba(250, 204, 21, 0.16)',
  accent2: '#FB923C',
  accent3: '#F59E0B',
  glowPrimary: 'rgba(250, 204, 21, 0.28)',
  danger: '#F87171',
  dangerLight: 'rgba(248, 113, 113, 0.14)',
  success: '#34D399',
  successLight: 'rgba(52, 211, 153, 0.14)',
  warning: '#FBBF24',
  warningLight: 'rgba(251, 191, 36, 0.14)',
  badge: 'rgba(255, 255, 255, 0.08)',
  tabBarBg: 'rgba(18, 21, 28, 0.94)',
  dockActiveBg: '#262933',
  dockActiveBorder: 'rgba(255, 255, 255, 0.18)',
};

export const darkColors: ColorPalette = {
  background: '#060709', // Deep Obsidian Pitch Black
  card: 'rgba(17, 20, 28, 0.80)',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  cardBorderTop: 'rgba(255, 255, 255, 0.18)',
  surface: 'rgba(255, 255, 255, 0.05)',
  glassPanel: 'rgba(16, 19, 26, 0.94)',
  glassPanelBorder: 'rgba(255, 255, 255, 0.12)',
  glassHover: 'rgba(255, 255, 255, 0.08)',
  text: '#FFFFFF',
  textMuted: '#9CA3AF',
  textDim: '#6B7280',
  border: 'rgba(255, 255, 255, 0.08)',
  primary: '#FACC15', // Solar Gold / Electric Amber
  primaryLight: 'rgba(250, 204, 21, 0.16)',
  accent2: '#FB923C',
  accent3: '#F59E0B',
  glowPrimary: 'rgba(250, 204, 21, 0.28)',
  danger: '#F87171',
  dangerLight: 'rgba(248, 113, 113, 0.14)',
  success: '#34D399',
  successLight: 'rgba(52, 211, 153, 0.14)',
  warning: '#FBBF24',
  warningLight: 'rgba(251, 191, 36, 0.14)',
  badge: 'rgba(255, 255, 255, 0.08)',
  tabBarBg: 'rgba(16, 19, 26, 0.94)',
  dockActiveBg: '#262933',
  dockActiveBorder: 'rgba(255, 255, 255, 0.18)',
};
