export interface AppIconInfo {
  iconType: 'ionicons' | 'material';
  iconName: string;
  brandColor: string;
  bgTint: string;
}

const KNOWN_APPS: Record<string, { name: string; iconType: 'ionicons' | 'material'; iconName: string; brandColor: string }> = {
  // Messaging & Social
  'com.whatsapp': { name: 'WhatsApp', iconType: 'ionicons', iconName: 'logo-whatsapp', brandColor: '#25D366' },
  'com.whatsapp.w4b': { name: 'WhatsApp Business', iconType: 'ionicons', iconName: 'logo-whatsapp', brandColor: '#25D366' },
  'org.telegram.messenger': { name: 'Telegram', iconType: 'ionicons', iconName: 'paper-plane', brandColor: '#229ED9' },
  'org.telegram.messenger.web': { name: 'Telegram', iconType: 'ionicons', iconName: 'paper-plane', brandColor: '#229ED9' },
  'com.facebook.orca': { name: 'Messenger', iconType: 'ionicons', iconName: 'chatbubble-ellipses', brandColor: '#0084FF' },
  'com.facebook.katana': { name: 'Facebook', iconType: 'ionicons', iconName: 'logo-facebook', brandColor: '#1877F2' },
  'com.facebook.lite': { name: 'Facebook Lite', iconType: 'ionicons', iconName: 'logo-facebook', brandColor: '#1877F2' },
  'com.instagram.android': { name: 'Instagram', iconType: 'ionicons', iconName: 'logo-instagram', brandColor: '#E1306C' },
  'com.twitter.android': { name: 'X', iconType: 'ionicons', iconName: 'logo-twitter', brandColor: '#F8FAFC' },
  'com.snapchat.android': { name: 'Snapchat', iconType: 'ionicons', iconName: 'logo-snapchat', brandColor: '#FFFC00' },
  'com.zhiliaoapp.musically': { name: 'TikTok', iconType: 'ionicons', iconName: 'logo-tiktok', brandColor: '#FE2C55' },
  'com.discord': { name: 'Discord', iconType: 'ionicons', iconName: 'logo-discord', brandColor: '#5865F2' },
  'com.slack': { name: 'Slack', iconType: 'ionicons', iconName: 'chatbubbles', brandColor: '#ECB22E' },
  'com.reddit.frontpage': { name: 'Reddit', iconType: 'ionicons', iconName: 'logo-reddit', brandColor: '#FF4500' },
  'com.linkedin.android': { name: 'LinkedIn', iconType: 'ionicons', iconName: 'logo-linkedin', brandColor: '#0A66C2' },
  'com.pinterest': { name: 'Pinterest', iconType: 'ionicons', iconName: 'logo-pinterest', brandColor: '#BD081C' },

  // Google Suite & Android Core
  'com.google.android.youtube': { name: 'YouTube', iconType: 'ionicons', iconName: 'logo-youtube', brandColor: '#FF0000' },
  'com.android.chrome': { name: 'Google Chrome', iconType: 'material', iconName: 'google-chrome', brandColor: '#4285F4' },
  'com.google.android.gm': { name: 'Gmail', iconType: 'ionicons', iconName: 'mail', brandColor: '#EA4335' },
  'com.google.android.apps.messaging': { name: 'Messages', iconType: 'ionicons', iconName: 'chatbox-ellipses', brandColor: '#1A73E8' },
  'com.google.android.dialer': { name: 'Phone', iconType: 'ionicons', iconName: 'call', brandColor: '#34A853' },
  'com.android.dialer': { name: 'Phone', iconType: 'ionicons', iconName: 'call', brandColor: '#34A853' },
  'com.google.android.apps.photos': { name: 'Google Photos', iconType: 'ionicons', iconName: 'images', brandColor: '#FBBC04' },
  'com.google.android.apps.maps': { name: 'Google Maps', iconType: 'ionicons', iconName: 'map', brandColor: '#34A853' },
  'com.google.android.calendar': { name: 'Calendar', iconType: 'ionicons', iconName: 'calendar', brandColor: '#4285F4' },
  'com.google.android.keep': { name: 'Keep Notes', iconType: 'ionicons', iconName: 'clipboard', brandColor: '#FBBC04' },
  'com.google.android.googlequicksearchbox': { name: 'Google', iconType: 'ionicons', iconName: 'logo-google', brandColor: '#4285F4' },
  'com.google.android.apps.docs': { name: 'Google Drive', iconType: 'ionicons', iconName: 'cloud', brandColor: '#1FA463' },
  'com.android.vending': { name: 'Google Play', iconType: 'ionicons', iconName: 'logo-google-playstore', brandColor: '#00C1A6' },
  'android': { name: 'Android System', iconType: 'ionicons', iconName: 'hardware-chip-outline', brandColor: '#3DDC84' },
  'com.android.settings': { name: 'Settings', iconType: 'ionicons', iconName: 'settings-outline', brandColor: '#94A3B8' },

  // Productivity & Media
  'com.spotify.music': { name: 'Spotify', iconType: 'material', iconName: 'spotify', brandColor: '#1DB954' },
  'com.netflix.mediaclient': { name: 'Netflix', iconType: 'ionicons', iconName: 'film', brandColor: '#E50914' },
  'com.microsoft.teams': { name: 'Teams', iconType: 'material', iconName: 'microsoft-teams', brandColor: '#6264A7' },
  'com.microsoft.office.outlook': { name: 'Outlook', iconType: 'material', iconName: 'microsoft-outlook', brandColor: '#0078D4' },
  'com.amazon.mShop.android.shopping': { name: 'Amazon', iconType: 'ionicons', iconName: 'cart', brandColor: '#FF9900' },
  'com.ubercab': { name: 'Uber', iconType: 'ionicons', iconName: 'car', brandColor: '#F8FAFC' },
  'com.apple.android.music': { name: 'Apple Music', iconType: 'ionicons', iconName: 'logo-apple', brandColor: '#FA2D48' },
};

/**
 * Resolves a clean, human-friendly application name from package name and raw metadata.
 */
export function resolveAppName(packageName: string, rawAppName?: string | null): string {
  // Direct dictionary lookup
  const known = KNOWN_APPS[packageName.toLowerCase()];
  if (known) {
    return known.name;
  }

  // If provided rawAppName is clean (not a reverse domain / package name), return it
  if (rawAppName && rawAppName.trim().length > 0 && !rawAppName.includes('.') && rawAppName !== packageName) {
    return rawAppName.trim();
  }

  // Smart heuristic for reverse domains e.g. com.example.subapp -> Subapp
  const parts = packageName.split('.');
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart.length > 1) {
      // Capitalize first letter and split camelCase if any
      const readable = lastPart.replace(/([A-Z])/g, ' $1').trim();
      return readable.charAt(0).toUpperCase() + readable.slice(1);
    }
  }

  return rawAppName || packageName;
}

/**
 * Resolves crisp icon config matching Liquid Glass Design tokens.
 */
export function resolveAppIcon(packageName: string): AppIconInfo {
  const known = KNOWN_APPS[packageName.toLowerCase()];
  if (known) {
    return {
      iconType: known.iconType,
      iconName: known.iconName,
      brandColor: known.brandColor,
      bgTint: `${known.brandColor}18`, // 10% alpha
    };
  }

  // Content heuristic based on package naming
  const lower = packageName.toLowerCase();
  if (lower.includes('mail') || lower.includes('email')) {
    return { iconType: 'ionicons', iconName: 'mail', brandColor: '#EA4335', bgTint: 'rgba(234, 67, 53, 0.12)' };
  }
  if (lower.includes('chat') || lower.includes('msg') || lower.includes('message')) {
    return { iconType: 'ionicons', iconName: 'chatbubble-ellipses', brandColor: '#38BDF8', bgTint: 'rgba(56, 189, 248, 0.12)' };
  }
  if (lower.includes('call') || lower.includes('phone') || lower.includes('dialer')) {
    return { iconType: 'ionicons', iconName: 'call', brandColor: '#34D399', bgTint: 'rgba(52, 211, 153, 0.12)' };
  }
  if (lower.includes('browser') || lower.includes('web')) {
    return { iconType: 'ionicons', iconName: 'globe-outline', brandColor: '#38BDF8', bgTint: 'rgba(56, 189, 248, 0.12)' };
  }
  if (lower.includes('music') || lower.includes('audio') || lower.includes('sound')) {
    return { iconType: 'ionicons', iconName: 'musical-notes', brandColor: '#C084FC', bgTint: 'rgba(192, 132, 252, 0.12)' };
  }
  if (lower.includes('video') || lower.includes('tv') || lower.includes('player')) {
    return { iconType: 'ionicons', iconName: 'play-circle', brandColor: '#F87171', bgTint: 'rgba(248, 113, 113, 0.12)' };
  }
  if (lower.includes('shop') || lower.includes('store') || lower.includes('cart')) {
    return { iconType: 'ionicons', iconName: 'cart', brandColor: '#FBBF24', bgTint: 'rgba(251, 191, 36, 0.12)' };
  }
  if (lower.includes('game') || lower.includes('play')) {
    return { iconType: 'ionicons', iconName: 'game-controller', brandColor: '#818CF8', bgTint: 'rgba(129, 140, 248, 0.12)' };
  }

  // Elegant Liquid Glass fallback: Cyan / Ice highlight
  return {
    iconType: 'ionicons',
    iconName: 'notifications-outline',
    brandColor: '#38BDF8',
    bgTint: 'rgba(56, 189, 248, 0.10)',
  };
}
