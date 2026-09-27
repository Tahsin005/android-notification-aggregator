const APP_PALETTE = [
  { bg: '#E0F2FE', text: '#0369A1' }, // Sky
  { bg: '#DCFCE7', text: '#15803D' }, // Green
  { bg: '#FEF3C7', text: '#B45309' }, // Amber
  { bg: '#F3E8FF', text: '#7E22CE' }, // Purple
  { bg: '#FEE2E2', text: '#B91C1C' }, // Red
  { bg: '#E0E7FF', text: '#4338CA' }, // Indigo
  { bg: '#FFEDD5', text: '#C2410C' }, // Orange
  { bg: '#FCE7F3', text: '#BE185D' }, // Pink
  { bg: '#CCFBF1', text: '#0F766E' }, // Teal
];

export function getAppColor(packageName: string) {
  let hash = 0;
  for (let i = 0; i < packageName.length; i++) {
    hash = packageName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % APP_PALETTE.length;
  return APP_PALETTE[index];
}

export function getAppInitials(appName: string): string {
  if (!appName) return '??';
  const clean = appName.trim();
  const words = clean.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}
