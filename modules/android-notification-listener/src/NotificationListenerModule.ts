import { NativeModule, requireOptionalNativeModule } from 'expo';
import {
  NativeNotificationItem,
  NotificationRemovedEvent,
  NativeDbNotificationItem,
  NativeAppSummary,
  NativeNotificationStats,
} from './NotificationListener.types';

declare class NotificationListenerNativeModule extends NativeModule<{
  onNotificationPosted: (notification: NativeNotificationItem) => void;
  onNotificationRemoved: (event: NotificationRemovedEvent) => void;
}> {
  isPermissionGranted(): Promise<boolean>;
  openNotificationAccessSettings(): Promise<boolean>;
  getActiveNotifications(): Promise<NativeNotificationItem[]>;
  openApp(packageName: string): Promise<boolean>;
  markAsRead(notificationKey: string): Promise<boolean>;
  markAsUnread(notificationKey: string): Promise<boolean>;
  markAllAsRead(): Promise<boolean>;
  deleteNotification(notificationKey: string): Promise<boolean>;
  clearAllNotifications(): Promise<boolean>;
  isDndEnabled(): Promise<boolean>;
  setDndEnabled(enabled: boolean): Promise<boolean>;
  getDndMode(): Promise<string>;
  setDndMode(mode: string): Promise<boolean>;
  getDndBlockedPackages(): Promise<string[]>;
  setDndBlockedPackages(packages: string[]): Promise<boolean>;
  toggleDndPackage(packageName: string): Promise<boolean>;
  getNotifications(params?: {
    limit?: number;
    offset?: number;
    filter?: string;
    packageName?: string;
    search?: string;
  }): Promise<NativeDbNotificationItem[]>;
  getAppsSummary(): Promise<NativeAppSummary[]>;
  getUnreadCount(): Promise<number>;
  getNotificationStats(): Promise<NativeNotificationStats>;
  getSetting(key: string, defaultValue: string): Promise<string>;
  setSetting(key: string, value: string): Promise<boolean>;
  deleteExpiredNotifications(retention: string): Promise<number>;
  insertNotification(item: Record<string, any>): Promise<boolean>;
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
  async markAsRead(_notificationKey: string): Promise<boolean> {
    return true;
  },
  async markAsUnread(_notificationKey: string): Promise<boolean> {
    return true;
  },
  async markAllAsRead(): Promise<boolean> {
    return true;
  },
  async deleteNotification(_notificationKey: string): Promise<boolean> {
    return true;
  },
  async clearAllNotifications(): Promise<boolean> {
    return true;
  },
  async isDndEnabled(): Promise<boolean> {
    return false;
  },
  async setDndEnabled(_enabled: boolean): Promise<boolean> {
    return true;
  },
  async getDndMode(): Promise<string> {
    return 'all';
  },
  async setDndMode(_mode: string): Promise<boolean> {
    return true;
  },
  async getDndBlockedPackages(): Promise<string[]> {
    return [];
  },
  async setDndBlockedPackages(_packages: string[]): Promise<boolean> {
    return true;
  },
  async toggleDndPackage(_packageName: string): Promise<boolean> {
    return true;
  },
  async getNotifications(_params?: any): Promise<NativeDbNotificationItem[]> {
    return [];
  },
  async getAppsSummary(): Promise<NativeAppSummary[]> {
    return [];
  },
  async getUnreadCount(): Promise<number> {
    return 0;
  },
  async getNotificationStats(): Promise<NativeNotificationStats> {
    return { totalCount: 0, unreadCount: 0, todayCount: 0, appsCount: 0 };
  },
  async getSetting(_key: string, defaultValue: string): Promise<string> {
    return defaultValue;
  },
  async setSetting(_key: string, _value: string): Promise<boolean> {
    return true;
  },
  async deleteExpiredNotifications(_retention: string): Promise<number> {
    return 0;
  },
  async insertNotification(_item: Record<string, any>): Promise<boolean> {
    return true;
  },
  addListener(_eventName: string, _listener: any) {
    return { remove: () => {} };
  },
  removeListeners() {},
};

export default (nativeModule || fallbackModule) as unknown as NotificationListenerNativeModule;
