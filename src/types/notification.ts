export interface NotificationItem {
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
  is_ongoing: number; // 0 or 1
  is_clearable: number; // 0 or 1
  is_read: number; // 0 or 1
  intercepted_in_dnd?: number; // 0 or 1
  removed_at: number | null;
  created_at: number;
}

export type DateFilter = 'all' | 'unread' | 'today' | 'yesterday' | 'dnd';

export type RetentionPeriod = '7_days' | '30_days' | 'forever';

export interface AppNotificationSummary {
  package_name: string;
  app_name: string;
  count: number;
  latest_timestamp: number;
}

export interface NotificationStats {
  totalCount: number;
  unreadCount: number;
  todayCount: number;
  appsCount: number;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  filter?: DateFilter;
  packageName?: string;
  search?: string;
}

export interface NotificationGroupSection {
  title: string;
  data: NotificationItem[];
}
