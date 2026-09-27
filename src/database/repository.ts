import { getDatabase } from './db';
import * as NativeListener from '@/modules/android-notification-listener';
import {
  NotificationItem,
  NotificationQueryParams,
  AppNotificationSummary,
  NotificationStats,
  RetentionPeriod,
} from '../types/notification';

export async function insertNotification(item: Omit<NotificationItem, 'id'>): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `
    INSERT INTO notifications (
      notification_key, package_name, app_name, title, text, big_text, sub_text,
      timestamp, category, group_key, channel_id, is_ongoing, is_clearable, is_read, removed_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(notification_key) DO UPDATE SET
      app_name = excluded.app_name,
      title = excluded.title,
      text = excluded.text,
      big_text = excluded.big_text,
      sub_text = excluded.sub_text,
      timestamp = excluded.timestamp,
      category = excluded.category,
      group_key = excluded.group_key,
      channel_id = excluded.channel_id,
      is_ongoing = excluded.is_ongoing,
      is_clearable = excluded.is_clearable,
      removed_at = NULL;
    `,
    [
      item.notification_key,
      item.package_name,
      item.app_name,
      item.title,
      item.text,
      item.big_text,
      item.sub_text,
      item.timestamp,
      item.category,
      item.group_key,
      item.channel_id,
      item.is_ongoing ?? 0,
      item.is_clearable ?? 1,
      item.is_read ?? 0,
      item.removed_at ?? null,
      item.created_at || Date.now(),
    ]
  );
}

export async function getNotifications(params: NotificationQueryParams = {}): Promise<NotificationItem[]> {
  const db = await getDatabase();
  const { page = 1, limit = 30, filter = 'all', packageName, search } = params;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const args: any[] = [];

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;

  if (filter === 'unread') {
    conditions.push('is_read = 0');
  } else if (filter === 'today') {
    conditions.push('timestamp >= ?');
    args.push(startOfToday);
  } else if (filter === 'yesterday') {
    conditions.push('timestamp >= ? AND timestamp < ?');
    args.push(startOfYesterday, startOfToday);
  }

  if (packageName) {
    conditions.push('package_name = ?');
    args.push(packageName);
  }

  if (search && search.trim().length > 0) {
    const term = `%${search.trim()}%`;
    conditions.push('(app_name LIKE ? OR title LIKE ? OR text LIKE ? OR big_text LIKE ?)');
    args.push(term, term, term, term);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `
    SELECT * FROM notifications
    ${whereClause}
    ORDER BY timestamp DESC
    LIMIT ? OFFSET ?;
  `;

  args.push(limit, offset);
  return await db.getAllAsync<NotificationItem>(query, args);
}

export async function searchNotifications(
  queryText: string,
  limit = 40,
  offset = 0
): Promise<NotificationItem[]> {
  const db = await getDatabase();
  const term = `%${queryText.trim()}%`;
  return await db.getAllAsync<NotificationItem>(
    `
    SELECT * FROM notifications
    WHERE app_name LIKE ? OR title LIKE ? OR text LIKE ? OR big_text LIKE ?
    ORDER BY timestamp DESC
    LIMIT ? OFFSET ?;
    `,
    [term, term, term, term, limit, offset]
  );
}

export async function getNotificationsByApp(
  packageName: string,
  limit = 40,
  offset = 0
): Promise<NotificationItem[]> {
  const db = await getDatabase();
  return await db.getAllAsync<NotificationItem>(
    `
    SELECT * FROM notifications
    WHERE package_name = ?
    ORDER BY timestamp DESC
    LIMIT ? OFFSET ?;
    `,
    [packageName, limit, offset]
  );
}

export async function getAppsSummary(): Promise<AppNotificationSummary[]> {
  const db = await getDatabase();
  return await db.getAllAsync<AppNotificationSummary>(`
    SELECT
      package_name,
      app_name,
      COUNT(*) as count,
      MAX(timestamp) as latest_timestamp
    FROM notifications
    GROUP BY package_name, app_name
    ORDER BY count DESC;
  `);
}

export async function getUnreadCount(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM notifications WHERE is_read = 0;`
  );
  return result?.count ?? 0;
}

export async function markAsRead(notificationKey: string): Promise<void> {
  try {
    if (NativeListener.markAsRead) {
      await NativeListener.markAsRead(notificationKey);
    }
  } catch (e) {
    console.warn('Native markAsRead error:', e);
  }

  try {
    const db = await getDatabase();
    await db.runAsync(`UPDATE notifications SET is_read = 1 WHERE notification_key = ?;`, [
      notificationKey,
    ]);
  } catch (e) {
    console.warn('expo-sqlite markAsRead error:', e);
  }
}

export async function markAsUnread(notificationKey: string): Promise<void> {
  try {
    if (NativeListener.markAsUnread) {
      await NativeListener.markAsUnread(notificationKey);
    }
  } catch (e) {
    console.warn('Native markAsUnread error:', e);
  }

  try {
    const db = await getDatabase();
    await db.runAsync(`UPDATE notifications SET is_read = 0 WHERE notification_key = ?;`, [
      notificationKey,
    ]);
  } catch (e) {
    console.warn('expo-sqlite markAsUnread error:', e);
  }
}

export async function markAllAsRead(): Promise<void> {
  try {
    if (NativeListener.markAllAsRead) {
      await NativeListener.markAllAsRead();
    }
  } catch (e) {
    console.warn('Native markAllAsRead error:', e);
  }

  try {
    const db = await getDatabase();
    await db.execAsync(`UPDATE notifications SET is_read = 1 WHERE is_read = 0;`);
  } catch (e) {
    console.warn('expo-sqlite markAllAsRead error:', e);
  }
}

export async function deleteNotification(notificationKey: string): Promise<void> {
  try {
    if (NativeListener.deleteNotification) {
      await NativeListener.deleteNotification(notificationKey);
    }
  } catch (e) {
    console.warn('Native deleteNotification error:', e);
  }

  try {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM notifications WHERE notification_key = ?;`, [notificationKey]);
  } catch (e) {
    console.warn('expo-sqlite deleteNotification error:', e);
  }
}

export async function clearNotifications(): Promise<void> {
  let nativeSuccess = false;
  try {
    if (NativeListener.clearAllNotifications) {
      nativeSuccess = await NativeListener.clearAllNotifications();
    }
  } catch (e) {
    console.warn('Native clearAllNotifications error:', e);
  }

  try {
    const db = await getDatabase();
    await db.execAsync(`DELETE FROM notifications;`);
  } catch (e) {
    console.warn('expo-sqlite clearNotifications error:', e);
    // If native cleared successfully, do not re-throw error
    if (!nativeSuccess) {
      throw e;
    }
  }
}

export async function deleteExpiredNotifications(retention: RetentionPeriod): Promise<number> {
  if (retention === 'forever') {
    return 0;
  }

  const now = Date.now();
  let days = 30;
  if (retention === '7_days') {
    days = 7;
  } else if (retention === '30_days') {
    days = 30;
  }

  const cutoff = now - days * 24 * 60 * 60 * 1000;
  const db = await getDatabase();
  const result = await db.runAsync(`DELETE FROM notifications WHERE timestamp < ?;`, [cutoff]);
  return result.changes;
}

export async function getNotificationStats(): Promise<NotificationStats> {
  const db = await getDatabase();
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const totalRow = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM notifications;`
  );
  const unreadRow = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM notifications WHERE is_read = 0;`
  );
  const todayRow = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM notifications WHERE timestamp >= ?;`,
    [startOfToday]
  );
  const appsRow = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(DISTINCT package_name) as count FROM notifications;`
  );

  return {
    totalCount: totalRow?.count ?? 0,
    unreadCount: unreadRow?.count ?? 0,
    todayCount: todayRow?.count ?? 0,
    appsCount: appsRow?.count ?? 0,
  };
}

export async function getSetting(key: string, defaultValue: string): Promise<string> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM app_settings WHERE key = ?;`,
    [key]
  );
  return row?.value ?? defaultValue;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `
    INSERT INTO app_settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value;
    `,
    [key, value]
  );
}
