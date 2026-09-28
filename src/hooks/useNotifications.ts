import { useCallback, useEffect, useState } from 'react';
import {
  clearNotifications,
  deleteNotification,
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  markAsUnread,
} from '../database/repository';
import { notificationEvents } from '../services/notificationEvents';
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
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    try {
      const [rows, count] = await Promise.all([
        getNotifications({
          page: 1,
          limit: PAGE_SIZE,
          filter,
          packageName,
          search: searchQuery,
        }),
        getUnreadCount(),
      ]);
      setNotifications(rows);
      setUnreadCount(count);
      setHasMore(rows.length === PAGE_SIZE);
      setPage(1);
    } catch (err) {
      console.warn('Error loading notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filter, packageName, searchQuery]);

  // Initial load or filter change
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getNotifications({
        page: 1,
        limit: PAGE_SIZE,
        filter,
        packageName,
        search: searchQuery,
      }),
      getUnreadCount(),
    ])
      .then(([rows, count]) => {
        if (!cancelled) {
          setNotifications(rows);
          setUnreadCount(count);
          setHasMore(rows.length === PAGE_SIZE);
          setPage(1);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Error loading notifications:', err);
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filter, packageName, searchQuery]);

  // Subscribe to centralized invalidation events across all screens
  useEffect(() => {
    const unsubscribe = notificationEvents.subscribe(() => {
      loadData();
    });
    return unsubscribe;
  }, [loadData]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }, [loadData]);

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
            intercepted_in_dnd: item.interceptedInDnd ?? 0,
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
        setUnreadCount((c) => c + 1);
        notificationEvents.notifyMutation();
      },
      onRemoved: ({ notificationKey, removedAt }) => {
        setNotifications((prev) =>
          prev.map((n) =>
            n.notification_key === notificationKey ? { ...n, removed_at: removedAt } : n
          )
        );
        notificationEvents.notifyMutation();
      },
    });

    return () => {
      sub.unsubscribe();
    };
  }, [packageName]);

  const deleteItem = useCallback(async (notificationKey: string) => {
    // Optimistic update
    setNotifications((prev) => prev.filter((n) => n.notification_key !== notificationKey));
    try {
      await deleteNotification(notificationKey);
    } catch (e) {
      console.warn('Error deleting notification from DB:', e);
    }
  }, []);

  const toggleRead = useCallback(async (notificationKey: string, currentlyRead: boolean) => {
    const nextReadState = currentlyRead ? 0 : 1;
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) =>
        n.notification_key === notificationKey ? { ...n, is_read: nextReadState } : n
      )
    );
    setUnreadCount((c) => Math.max(0, currentlyRead ? c + 1 : c - 1));
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
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    setUnreadCount(0);
    try {
      await markAllAsRead();
    } catch (e) {
      console.warn('Error marking all as read in DB:', e);
    }
  }, []);

  const clearAll = useCallback(async () => {
    // Optimistic update
    setNotifications([]);
    setUnreadCount(0);
    try {
      await clearNotifications();
    } catch (e) {
      console.warn('Error clearing all notifications from DB:', e);
    }
  }, []);

  return {
    notifications,
    unreadCount,
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
