import NotificationListenerModule from './NotificationListenerModule';
import { NativeNotificationItem, NotificationRemovedEvent } from './NotificationListener.types';

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
