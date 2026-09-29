import NotificationListenerModule from './NotificationListenerModule';
import {
  NativeNotificationItem,
  NotificationRemovedEvent,
  NativeDbNotificationItem,
  NativeAppSummary,
  NativeNotificationStats,
} from './NotificationListener.types';

export async function isPermissionGranted(): Promise<boolean> {
  return await NotificationListenerModule.isPermissionGranted();
}

export async function openNotificationAccessSettings(): Promise<boolean> {
  return await NotificationListenerModule.openNotificationAccessSettings();
}

export async function getActiveNotifications(): Promise<NativeNotificationItem[]> {
  return await NotificationListenerModule.getActiveNotifications();
}

export async function openApp(packageName: string): Promise<boolean> {
  return await NotificationListenerModule.openApp(packageName);
}

export async function markAsRead(notificationKey: string): Promise<boolean> {
  return await NotificationListenerModule.markAsRead(notificationKey);
}

export async function markAsUnread(notificationKey: string): Promise<boolean> {
  return await NotificationListenerModule.markAsUnread(notificationKey);
}

export async function markAllAsRead(): Promise<boolean> {
  return await NotificationListenerModule.markAllAsRead();
}

export async function deleteNotification(notificationKey: string): Promise<boolean> {
  return await NotificationListenerModule.deleteNotification(notificationKey);
}

export async function clearAllNotifications(): Promise<boolean> {
  return await NotificationListenerModule.clearAllNotifications();
}

export async function isDndEnabled(): Promise<boolean> {
  return await NotificationListenerModule.isDndEnabled();
}

export async function setDndEnabled(enabled: boolean): Promise<boolean> {
  return await NotificationListenerModule.setDndEnabled(enabled);
}

export async function getDndMode(): Promise<string> {
  return await NotificationListenerModule.getDndMode();
}

export async function setDndMode(mode: string): Promise<boolean> {
  return await NotificationListenerModule.setDndMode(mode);
}

export async function getDndBlockedPackages(): Promise<string[]> {
  return await NotificationListenerModule.getDndBlockedPackages();
}

export async function setDndBlockedPackages(packages: string[]): Promise<boolean> {
  return await NotificationListenerModule.setDndBlockedPackages(packages);
}

export async function toggleDndPackage(packageName: string): Promise<boolean> {
  return await NotificationListenerModule.toggleDndPackage(packageName);
}

export async function getNotifications(params?: {
  limit?: number;
  offset?: number;
  filter?: string;
  packageName?: string;
  search?: string;
}): Promise<NativeDbNotificationItem[]> {
  return await NotificationListenerModule.getNotifications(params);
}

export async function getAppsSummary(): Promise<NativeAppSummary[]> {
  return await NotificationListenerModule.getAppsSummary();
}

export async function getUnreadCount(): Promise<number> {
  return await NotificationListenerModule.getUnreadCount();
}

export async function getNotificationStats(): Promise<NativeNotificationStats> {
  return await NotificationListenerModule.getNotificationStats();
}

export async function getSetting(key: string, defaultValue: string): Promise<string> {
  return await NotificationListenerModule.getSetting(key, defaultValue);
}

export async function setSetting(key: string, value: string): Promise<boolean> {
  return await NotificationListenerModule.setSetting(key, value);
}

export async function deleteExpiredNotifications(retention: string): Promise<number> {
  return await NotificationListenerModule.deleteExpiredNotifications(retention);
}

export async function insertNotification(item: Record<string, any>): Promise<boolean> {
  return await NotificationListenerModule.insertNotification(item);
}

export async function getAnalyticsData(sinceTimestamp: number): Promise<import('./NotificationListener.types').NativeAnalyticsData> {
  return await NotificationListenerModule.getAnalyticsData(sinceTimestamp);
}

export function addNotificationPostedListener(
  listener: (notification: NativeNotificationItem) => void
) {
  return NotificationListenerModule.addListener('onNotificationPosted', listener);
}

export function addNotificationRemovedListener(
  listener: (event: NotificationRemovedEvent) => void
) {
  return NotificationListenerModule.addListener('onNotificationRemoved', listener);
}

export * from './NotificationListener.types';
export default NotificationListenerModule;
