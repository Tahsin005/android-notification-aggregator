import { NativeNotificationItem } from './NotificationListener.types';

export default {
  async isPermissionGranted(): Promise<boolean> {
    return false;
  },
  async openNotificationAccessSettings(): Promise<boolean> {
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
