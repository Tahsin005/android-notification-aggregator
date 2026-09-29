import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getAnalyticsData } from '../database/repository';
import { notificationEvents } from '../services/notificationEvents';
import { AnalyticsData, AnalyticsTimeRange } from '../types/notification';

const INITIAL_DATA: AnalyticsData = {
  totalCount: 0,
  unreadCount: 0,
  dndCount: 0,
  appsCount: 0,
  topApps: [],
  hourly: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 })),
  dayOfWeek: Array.from({ length: 7 }, (_, i) => ({ day: i, count: 0 })),
};

export function useAnalytics(initialRange: AnalyticsTimeRange = 'today') {
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>(initialRange);
  const [data, setData] = useState<AnalyticsData>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const requestIdRef = useRef(0);

  const loadData = useCallback(async (range: AnalyticsTimeRange) => {
    const currentId = ++requestIdRef.current;
    try {
      const result = await getAnalyticsData(range);
      if (currentId === requestIdRef.current) {
        setData(result);
      }
    } catch (e) {
      console.warn('Failed to load analytics data:', e);
    } finally {
      if (currentId === requestIdRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  // Fetch when timeRange changes
  useEffect(() => {
    const currentId = ++requestIdRef.current;
    getAnalyticsData(timeRange)
      .then((result) => {
        if (currentId === requestIdRef.current) {
          setData(result);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to load analytics data:', err);
        if (currentId === requestIdRef.current) {
          setIsLoading(false);
        }
      });
  }, [timeRange]);

  // Subscribe to live notification mutations
  useEffect(() => {
    const unsubscribe = notificationEvents.subscribe(() => {
      loadData(timeRange);
    });
    return unsubscribe;
  }, [timeRange, loadData]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData(timeRange);
  }, [timeRange, loadData]);

  // Derived metrics
  const peakHour = useMemo(() => {
    let max = { hour: 0, count: 0 };
    for (const item of data.hourly) {
      if (item.count > max.count) {
        max = item;
      }
    }
    return max;
  }, [data.hourly]);

  const busiestApp = useMemo(() => {
    return data.topApps.length > 0 ? data.topApps[0] : null;
  }, [data.topApps]);

  const dndRatio = useMemo(() => {
    if (data.totalCount === 0) return 0;
    return Math.round((data.dndCount / data.totalCount) * 100);
  }, [data.totalCount, data.dndCount]);

  // Average 1.5 mins of focus preserved per intercepted distraction
  const focusMinutesSaved = useMemo(() => {
    return Math.round(data.dndCount * 1.5);
  }, [data.dndCount]);

  return {
    timeRange,
    setTimeRange,
    data,
    peakHour,
    busiestApp,
    dndRatio,
    focusMinutesSaved,
    isLoading,
    isRefreshing,
    refresh,
  };
}
