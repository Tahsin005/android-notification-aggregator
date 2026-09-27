import { NotificationGroupSection, NotificationItem } from '../types/notification';

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60 * 1000) {
    return 'Just now';
  }
  if (diff < 60 * 60 * 1000) {
    const mins = Math.floor(diff / (60 * 1000));
    return `${mins}m ago`;
  }
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}h ago`;
  }
  if (diff < 48 * 60 * 60 * 1000) {
    return 'Yesterday';
  }

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatFullDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })} at ${formatTime(timestamp)}`;
}

export function getDateSectionTitle(timestamp: number): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const startOfWeek = today - 6 * 86400000;

  if (timestamp >= today) {
    return 'TODAY';
  }
  if (timestamp >= yesterday) {
    return 'YESTERDAY';
  }
  if (timestamp >= startOfWeek) {
    return 'EARLIER THIS WEEK';
  }

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }).toUpperCase();
}

export function groupNotificationsByDate(
  notifications: NotificationItem[]
): NotificationGroupSection[] {
  const map = new Map<string, NotificationItem[]>();

  for (const item of notifications) {
    const section = getDateSectionTitle(item.timestamp);
    if (!map.has(section)) {
      map.set(section, []);
    }
    map.get(section)!.push(item);
  }

  const sections: NotificationGroupSection[] = [];
  map.forEach((items, title) => {
    sections.push({ title, data: items });
  });

  return sections;
}
