export interface NativeNotificationItem {
  notificationKey: string;
  packageName: string;
  appName: string;
  title: string | null;
  text: string | null;
  bigText: string | null;
  subText: string | null;
  timestamp: number;
  category: string | null;
  groupKey: string | null;
  channelId: string | null;
  isOngoing: boolean;
  isClearable: boolean;
  isRead: boolean;
  removedAt: number | null;
  createdAt: number;
}

export interface NotificationRemovedEvent {
  notificationKey: string;
  removedAt: number;
}
