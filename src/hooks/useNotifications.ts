import { useCallback, useEffect, useState } from 'react';
import {
  clearNotifications,
  deleteNotification,
  getNotifications,
  markAllAsRead,
  markAsRead,
  markAsUnread,
} from '../database/repository';
import { subscribeToNotificationEvents } from '../services/notificationService';
import { DateFilter, NotificationItem } from '../types/notification';

interface UseNotificationsProps {
  filter: DateFilter;
  packageName?: string;
  searchQuery?: string;
}

const PAGE_SIZE = 30;

export function useNotifications({ filter, packageName, searchQuery }: UseNotificationsProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Load initial or filter-changed items
  useEffect(() => {
    let isCancelled = false;

    getNotifications({
      page: 1,
      limit: PAGE_SIZE,
      filter,
      packageName,
      search: searchQuery,
    })
      .then((rows) => {
        if (!isCancelled) {
          setNotifications(rows);
          setHasMore(rows.length === PAGE_SIZE);
          setPage(1);
          setIsLoading(false);
          setIsRefreshing(false);
        }
      })
      .catch((err) => {
        console.warn('Error loading notifications:', err);
        if (!isCancelled) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [filter, packageName, searchQuery]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const rows = await getNotifications({
        page: 1,
        limit: PAGE_SIZE,
        filter,
        packageName,
        search: searchQuery,
      });
      setNotifications(rows);
      setHasMore(rows.length === PAGE_SIZE);
      setPage(1);
    } catch (e) {
      console.warn('Error refreshing notifications:', e);
    } finally {
      setIsRefreshing(false);
    }
  }, [filter, packageName, searchQuery]);

  const loadMore = useCallback(async () => {
    if (isLoading || isRefreshing || !hasMore) return;
    const nextPage = page + 1;
    try {
      const rows = await getNotifications({
        page: nextPage,
        limit: PAGE_SIZE,
        filter,
        packageName,
        search: searchQuery,
      });
      setNotifications((prev) => {
        const existingKeys = new Set(prev.map((n) => n.notification_key));
        const newRows = rows.filter((r) => !existingKeys.has(r.notification_key));
        return [...prev, ...newRows];
      });
      setHasMore(rows.length === PAGE_SIZE);
      setPage(nextPage);
    } catch (e) {
      console.warn('Error loading more notifications:', e);
    }
  }, [isLoading, isRefreshing, hasMore, page, filter, packageName, searchQuery]);

  // Subscribe to live background events from native listener
  useEffect(() => {
    const sub = subscribeToNotificationEvents({
      onPosted: (item) => {
        setNotifications((prev) => {
          const index = prev.findIndex((n) => n.notification_key === item.notificationKey);
          const newItem: NotificationItem = {
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
            created_at: item.createdAt,
          };

          if (index >= 0) {
            const copy = [...prev];
            copy[index] = { ...copy[index], ...newItem, is_read: copy[index].is_read };
            return copy;
          }

          if (packageName && packageName !== item.packageName) {
            return prev;
          }

          return [newItem, ...prev];
        });
      },
      onRemoved: ({ notificationKey, removedAt }) => {
        setNotifications((prev) =>
          prev.map((n) =>
            n.notification_key === notificationKey ? { ...n, removed_at: removedAt } : n
          )
        );
      },
    });

    return () => {
      sub.unsubscribe();
    };
  }, [packageName]);

  const deleteItem = useCallback(async (notificationKey: string) => {
    setNotifications((prev) => prev.filter((n) => n.notification_key !== notificationKey));
    try {
      await deleteNotification(notificationKey);
    } catch (e) {
      console.warn('Error deleting notification from DB:', e);
    }
  }, []);

  const toggleRead = useCallback(async (notificationKey: string, currentlyRead: boolean) => {
    const nextReadState = currentlyRead ? 0 : 1;
    setNotifications((prev) =>
      prev.map((n) =>
        n.notification_key === notificationKey ? { ...n, is_read: nextReadState } : n
      )
    );
    try {
      if (currentlyRead) {
        await markAsUnread(notificationKey);
      } else {
        await markAsRead(notificationKey);
      }
    } catch (e) {
      console.warn('Error updating read status in DB:', e);
    }
  }, []);

  const markAll = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    try {
      await markAllAsRead();
    } catch (e) {
      console.warn('Error marking all as read in DB:', e);
    }
  }, []);

  const clearAll = useCallback(async () => {
    setNotifications([]);
    try {
      await clearNotifications();
    } catch (e) {
      console.warn('Error clearing all notifications from DB:', e);
    }
  }, []);

  return {
    notifications,
    isLoading,
    isRefreshing,
    hasMore,
    refresh,
    loadMore,
    deleteItem,
    toggleRead,
    markAllAsRead: markAll,
    clearAll,
  };
}
