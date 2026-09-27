import { NativeModule, requireOptionalNativeModule } from 'expo';
import { NativeNotificationItem, NotificationRemovedEvent } from './NotificationListener.types';

declare class NotificationListenerNativeModule extends NativeModule<{
  onNotificationPosted: (notification: NativeNotificationItem) => void;
  onNotificationRemoved: (event: NotificationRemovedEvent) => void;
}> {
  isPermissionGranted(): Promise<boolean>;
  openNotificationAccessSettings(): Promise<boolean>;
  getActiveNotifications(): Promise<NativeNotificationItem[]>;
  openApp(packageName: string): Promise<boolean>;
}

const nativeModule = requireOptionalNativeModule<NotificationListenerNativeModule>('NotificationListener');

const fallbackModule = {
  async isPermissionGranted(): Promise<boolean> {
    console.warn(
      '[NotificationListener] Running in Expo Go or environment without native module. Please run with `bun run android` for real native notification listening.'
    );
    return false;
  },
  async openNotificationAccessSettings(): Promise<boolean> {
    console.warn(
      '[NotificationListener] Running in Expo Go. Please build the native app with `bun run android` to access Android Notification Access settings.'
    );
    return false;
  },
  async getActiveNotifications(): Promise<NativeNotificationItem[]> {
    return [];
  },
  async openApp(_packageName: string): Promise<boolean> {
    return false;
  },
  addListener(_eventName: string, _listener: any) {
    return { remove: () => {} };
  },
  removeListeners() {},
};

export default (nativeModule || fallbackModule) as unknown as NotificationListenerNativeModule;
