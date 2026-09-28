import * as NativeListener from '@/modules/android-notification-listener';

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
    return active ? active.length : 0;
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
