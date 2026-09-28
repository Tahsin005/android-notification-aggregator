import { useState, useEffect, useCallback } from 'react';
import * as NativeListener from '@/modules/android-notification-listener';
import { notificationEvents } from '../services/notificationEvents';

export function useDnd() {
  const [isDnd, setIsDnd] = useState<boolean>(false);
  const [dndMode, setDndModeState] = useState<'all' | 'selected'>('all');
  const [blockedPackages, setBlockedPackagesState] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshState = useCallback(async () => {
    try {
      const [enabled, mode, blocked] = await Promise.all([
        NativeListener.isDndEnabled(),
        NativeListener.getDndMode(),
        NativeListener.getDndBlockedPackages(),
      ]);
      setIsDnd(Boolean(enabled));
      setDndModeState(mode === 'selected' ? 'selected' : 'all');
      setBlockedPackagesState(blocked || []);
    } catch (e) {
      console.warn('Failed to load DND state:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      NativeListener.isDndEnabled(),
      NativeListener.getDndMode(),
      NativeListener.getDndBlockedPackages(),
    ])
      .then(([enabled, mode, blocked]) => {
        if (!isMounted) return;
        setIsDnd(Boolean(enabled));
        setDndModeState(mode === 'selected' ? 'selected' : 'all');
        setBlockedPackagesState(blocked || []);
      })
      .catch((e) => {
        console.warn('Failed to load initial DND state:', e);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    const unsub = notificationEvents.subscribe(() => {
      refreshState();
    });
    return () => {
      isMounted = false;
      unsub();
    };
  }, [refreshState]);

  const toggleDnd = useCallback(async () => {
    try {
      const next = !isDnd;
      setIsDnd(next);
      await NativeListener.setDndEnabled(next);
      notificationEvents.notifyMutation();
    } catch (e) {
      console.warn('Failed to toggle DND:', e);
      refreshState();
    }
  }, [isDnd, refreshState]);

  const setDndMode = useCallback(async (mode: 'all' | 'selected') => {
    try {
      setDndModeState(mode);
      await NativeListener.setDndMode(mode);
      notificationEvents.notifyMutation();
    } catch (e) {
      console.warn('Failed to set DND mode:', e);
      refreshState();
    }
  }, [refreshState]);

  const toggleAppBlocked = useCallback(async (packageName: string) => {
    try {
      await NativeListener.toggleDndPackage(packageName);
      const updated = await NativeListener.getDndBlockedPackages();
      setBlockedPackagesState(updated || []);
      notificationEvents.notifyMutation();
    } catch (e) {
      console.warn('Failed to toggle app DND status:', e);
      refreshState();
    }
  }, [refreshState]);

  const isAppBlocked = useCallback((packageName: string) => {
    if (!isDnd) return false;
    if (dndMode === 'all') return true;
    return blockedPackages.includes(packageName);
  }, [isDnd, dndMode, blockedPackages]);

  return {
    isDnd,
    dndMode,
    blockedPackages,
    isLoading,
    toggleDnd,
    setDndMode,
    toggleAppBlocked,
    isAppBlocked,
    refreshState,
  };
}
