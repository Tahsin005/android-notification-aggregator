import { useCallback, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  checkNotificationPermission,
  requestNotificationPermission,
  syncActiveNotifications,
} from '../services/notificationService';

export function useNotificationPermission() {
  const [isGranted, setIsGranted] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const check = useCallback(async () => {
    setIsChecking(true);
    try {
      const granted = await checkNotificationPermission();
      setIsGranted((prev) => {
        // If transitioning from false to true, trigger active sync
        if (prev === false && granted) {
          syncActiveNotifications().catch(console.warn);
        }
        return granted;
      });
      return granted;
    } catch (e) {
      console.warn('Failed to check permission:', e);
      setIsGranted(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const request = useCallback(async () => {
    await requestNotificationPermission();
  }, []);

  const sync = useCallback(async () => {
    setIsSyncing(true);
    try {
      return await syncActiveNotifications();
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    checkNotificationPermission()
      .then((granted) => {
        if (isMounted) {
          setIsGranted(granted);
          setIsChecking(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsGranted(false);
          setIsChecking(false);
        }
      });

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        check();
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      isMounted = false;
      sub.remove();
    };
  }, [check]);

  return {
    isGranted,
    isChecking,
    isSyncing,
    checkPermission: check,
    requestPermission: request,
    syncActiveNotifications: sync,
  };
}
