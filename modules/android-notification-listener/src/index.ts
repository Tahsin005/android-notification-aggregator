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
