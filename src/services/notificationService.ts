import * as NativeListener from '@/modules/android-notification-listener';
import { insertNotification } from '../database/repository';

export async function checkNotificationPermission(): Promise<boolean> {
  try {
    return await NativeListener.isPermissionGranted();
  } catch (e) {
    console.warn('Error checking notification permission:', e);
    return false;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    return await NativeListener.openNotificationAccessSettings();
  } catch (e) {
    console.warn('Error opening notification access settings:', e);
    return false;
  }
}

export async function syncActiveNotifications(): Promise<number> {
  try {
    const active = await NativeListener.getActiveNotifications();
    let imported = 0;
    for (const item of active) {
      if (item && item.notificationKey) {
        await insertNotification({
          notification_key: item.notificationKey,
          package_name: item.packageName,
          app_name: item.appName,
          title: item.title,
          text: item.text,
          big_text: item.bigText,
          sub_text: item.subText,
          timestamp: item.timestamp,
          category: item.category,
          group_key: item.groupKey,
          channel_id: item.channelId,
          is_ongoing: item.isOngoing ? 1 : 0,
          is_clearable: item.isClearable ? 1 : 0,
          is_read: 0,
          removed_at: item.removedAt,
          created_at: item.createdAt || Date.now(),
        });
        imported++;
      }
    }
    return imported;
  } catch (e) {
    console.warn('Error syncing active notifications:', e);
    return 0;
  }
}

export async function launchApp(packageName: string): Promise<boolean> {
  try {
    return await NativeListener.openApp(packageName);
  } catch (e) {
    console.warn(`Error opening app ${packageName}:`, e);
    return false;
  }
}

export function subscribeToNotificationEvents(callbacks: {
  onPosted?: (item: NativeListener.NativeNotificationItem) => void;
  onRemoved?: (event: NativeListener.NotificationRemovedEvent) => void;
}) {
  const subscriptions: { remove: () => void }[] = [];

  if (callbacks.onPosted) {
    subscriptions.push(NativeListener.addNotificationPostedListener(callbacks.onPosted));
  }
  if (callbacks.onRemoved) {
    subscriptions.push(NativeListener.addNotificationRemovedListener(callbacks.onRemoved));
  }

  return {
    unsubscribe: () => {
      subscriptions.forEach((sub) => sub.remove());
    },
  };
}
