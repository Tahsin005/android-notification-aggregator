import * as NativeListener from '@/modules/android-notification-listener';
import { notificationEvents } from '../services/notificationEvents';
import { resolveAppName } from '../utils/appInfo';
import {
  NotificationItem,
  NotificationQueryParams,
  AppNotificationSummary,
  NotificationStats,
  RetentionPeriod,
} from '../types/notification';

export async function insertNotification(
  item: Omit<NotificationItem, 'id'>,
  triggerMutation = true
): Promise<void> {
  const cleanAppName = resolveAppName(item.package_name, item.app_name);
  await NativeListener.insertNotification({
    notification_key: item.notification_key,
    package_name: item.package_name,
    app_name: cleanAppName,
    title: item.title ?? null,
    text: item.text ?? null,
    big_text: item.big_text ?? null,
    sub_text: item.sub_text ?? null,
    timestamp: item.timestamp,
    category: item.category ?? null,
    group_key: item.group_key ?? null,
    channel_id: item.channel_id ?? null,
    is_ongoing: item.is_ongoing ?? 0,
    is_clearable: item.is_clearable ?? 1,
    is_read: item.is_read ?? 0,
    intercepted_in_dnd: item.intercepted_in_dnd ?? 0,
    removed_at: item.removed_at ?? null,
    created_at: item.created_at || Date.now(),
  });

  if (triggerMutation) {
    notificationEvents.notifyMutation();
  }
}

export async function getNotifications(params: NotificationQueryParams = {}): Promise<NotificationItem[]> {
  const { page = 1, limit = 30, filter = 'all', packageName, search } = params;
  const offset = (page - 1) * limit;

  const results = await NativeListener.getNotifications({
    limit,
    offset,
    filter,
    packageName,
    search: search && search.trim().length > 0 ? search.trim() : undefined,
  });

  return (results || []).map((row) => ({
    id: row.id,
    notification_key: row.notification_key,
    package_name: row.package_name,
    app_name: resolveAppName(row.package_name, row.app_name),
    title: row.title ?? null,
    text: row.text ?? null,
    big_text: row.big_text ?? null,
    sub_text: row.sub_text ?? null,
    timestamp: row.timestamp,
    category: row.category ?? null,
    group_key: row.group_key ?? null,
    channel_id: row.channel_id ?? null,
    is_ongoing: row.is_ongoing ?? 0,
    is_clearable: row.is_clearable ?? 1,
    is_read: row.is_read ?? 0,
    intercepted_in_dnd: row.intercepted_in_dnd ?? 0,
    removed_at: row.removed_at ?? null,
    created_at: row.created_at,
  }));
}

export async function searchNotifications(
  queryText: string,
  limit = 40,
  offset = 0
): Promise<NotificationItem[]> {
  return await getNotifications({
    page: Math.floor(offset / limit) + 1,
    limit,
    search: queryText,
  });
}

export async function getNotificationsByApp(
  packageName: string,
  limit = 40,
  offset = 0
): Promise<NotificationItem[]> {
  return await getNotifications({
    page: Math.floor(offset / limit) + 1,
    limit,
    packageName,
  });
}

export async function getAppsSummary(): Promise<AppNotificationSummary[]> {
  const rows = await NativeListener.getAppsSummary();
  return (rows || []).map((r) => ({
    package_name: r.package_name,
    app_name: resolveAppName(r.package_name, r.app_name),
    count: r.count,
    latest_timestamp: r.latest_timestamp,
  }));
}

export async function getUnreadCount(): Promise<number> {
  return await NativeListener.getUnreadCount();
}

export async function markAsRead(notificationKey: string): Promise<void> {
  await NativeListener.markAsRead(notificationKey);
  notificationEvents.notifyMutation();
}

export async function markAsUnread(notificationKey: string): Promise<void> {
  await NativeListener.markAsUnread(notificationKey);
  notificationEvents.notifyMutation();
}

export async function markAllAsRead(): Promise<void> {
  await NativeListener.markAllAsRead();
  notificationEvents.notifyMutation();
}

export async function deleteNotification(notificationKey: string): Promise<void> {
  await NativeListener.deleteNotification(notificationKey);
  notificationEvents.notifyMutation();
}

export async function clearNotifications(): Promise<void> {
  const success = await NativeListener.clearAllNotifications();
  if (!success) {
    throw new Error('Failed to clear notifications');
  }
  notificationEvents.notifyMutation();
}

export async function deleteExpiredNotifications(retention: RetentionPeriod): Promise<number> {
  const deletedCount = await NativeListener.deleteExpiredNotifications(retention);
  if (deletedCount > 0) {
    notificationEvents.notifyMutation();
  }
  return deletedCount;
}

export async function getNotificationStats(): Promise<NotificationStats> {
  const stats = await NativeListener.getNotificationStats();
  return {
    totalCount: stats?.totalCount ?? 0,
    unreadCount: stats?.unreadCount ?? 0,
    todayCount: stats?.todayCount ?? 0,
    appsCount: stats?.appsCount ?? 0,
  };
}

export async function getSetting(key: string, defaultValue: string): Promise<string> {
  return await NativeListener.getSetting(key, defaultValue);
}

export async function setSetting(key: string, value: string): Promise<void> {
  await NativeListener.setSetting(key, value);
}
