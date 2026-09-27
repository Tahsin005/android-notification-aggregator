export interface ColorPalette {
  background: string;
  card: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryLight: string;
  danger: string;
  dangerLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  badge: string;
}

export const lightColors: ColorPalette = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  surface: '#F1F5F9',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  badge: '#E2E8F0',
};

export const darkColors: ColorPalette = {
  background: '#0B0F19',
  card: '#151C2C',
  surface: '#1E293B',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  border: '#1E293B',
  primary: '#3B82F6',
  primaryLight: '#1E3A8A',
  danger: '#F87171',
  dangerLight: '#450A0A',
  success: '#34D399',
  successLight: '#064E3B',
  warning: '#FBBF24',
  warningLight: '#451A03',
  badge: '#334155',
};
