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
  interceptedInDnd?: number;
  removedAt: number | null;
  createdAt: number;
}

export interface NotificationRemovedEvent {
  notificationKey: string;
  removedAt: number;
}

export interface NativeDbNotificationItem {
  id?: number;
  notification_key: string;
  package_name: string;
  app_name: string;
  title: string | null;
  text: string | null;
  big_text: string | null;
  sub_text: string | null;
  timestamp: number;
  category: string | null;
  group_key: string | null;
  channel_id: string | null;
  is_ongoing: number;
  is_clearable: number;
  is_read: number;
  intercepted_in_dnd?: number;
  removed_at: number | null;
  created_at: number;
}

export interface NativeAppSummary {
  package_name: string;
  app_name: string;
  count: number;
  latest_timestamp: number;
}

export interface NativeNotificationStats {
  totalCount: number;
  unreadCount: number;
  todayCount: number;
  appsCount: number;
}
