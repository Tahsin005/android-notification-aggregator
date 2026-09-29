import {
  NativeNotificationItem,
  NativeDbNotificationItem,
  NativeAppSummary,
  NativeNotificationStats,
} from './NotificationListener.types';

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
  async getAnalyticsData(_sinceTimestamp: number): Promise<import('./NotificationListener.types').NativeAnalyticsData> {
    return {
      totalCount: 0,
      unreadCount: 0,
      dndCount: 0,
      appsCount: 0,
      topApps: [],
      hourly: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 })),
      dayOfWeek: Array.from({ length: 7 }, (_, i) => ({ day: i, count: 0 })),
    };
  },
  addListener(_eventName: string, _listener: any) {
    return { remove: () => {} };
  },
  removeListeners() {},
};
