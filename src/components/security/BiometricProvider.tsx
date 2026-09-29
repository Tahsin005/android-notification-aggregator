import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { BiometricContext } from '../../hooks/useBiometrics';
import {
  authenticateWithBiometrics,
  AutoLockTimeout,
  BiometricCapabilities,
  getAutoLockTimeout,
  getBiometricCapabilities,
  isBiometricLockEnabled,
  setAutoLockTimeout as persistAutoLockTimeout,
  setBiometricLockEnabled,
} from '../../services/biometricService';
import { BiometricLockScreen } from './BiometricLockScreen';

const DEFAULT_CAPABILITIES: BiometricCapabilities = {
  hasHardware: false,
  isEnrolled: false,
  supportedTypes: [],
  canAuthenticate: false,
};

export const BiometricProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [capabilities, setCapabilities] =
    useState<BiometricCapabilities>(DEFAULT_CAPABILITIES);
  const [isLockEnabled, setIsLockEnabled] = useState<boolean>(false);
  const [autoLockTimeout, setAutoLockTimeoutState] =
    useState<AutoLockTimeout>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const lastBackgroundTime = useRef<number>(0);
  const isLockEnabledRef = useRef<boolean>(false);
  const autoLockTimeoutRef = useRef<AutoLockTimeout>(0);
  const isAuthenticatingRef = useRef<boolean>(false);

  useEffect(() => {
    isLockEnabledRef.current = isLockEnabled;
    autoLockTimeoutRef.current = autoLockTimeout;
    isAuthenticatingRef.current = isAuthenticating;
  }, [isLockEnabled, autoLockTimeout, isAuthenticating]);

  const refreshCapabilities = useCallback(async () => {
    const caps = await getBiometricCapabilities();
    setCapabilities(caps);
  }, []);

  const unlock = useCallback(async (): Promise<boolean> => {
    if (isAuthenticatingRef.current) return false;

    setIsAuthenticating(true);
    setLastError(null);

    const result = await authenticateWithBiometrics(
      'Unlock Notification Vault'
    );

    setIsAuthenticating(false);

    if (result.success) {
      setIsLocked(false);
      setLastError(null);
      return true;
    } else {
      setLastError(result.error || 'Authentication cancelled or failed');
      return false;
    }
  }, []);

  // Initialize settings and initial lock state
  useEffect(() => {
    async function init() {
      const [caps, enabled, timeout] = await Promise.all([
        getBiometricCapabilities(),
        isBiometricLockEnabled(),
        getAutoLockTimeout(),
      ]);

      setCapabilities(caps);
      setIsLockEnabled(enabled);
      setAutoLockTimeoutState(timeout);

      if (enabled) {
        setIsLocked(true);
        // Automatic authentication prompt on launch
        setTimeout(() => {
          unlock();
        }, 150);
      }
    }

    init();
  }, [unlock]);

  // AppState listener for auto-lock on background resume
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState.match(/inactive|background/)) {
        lastBackgroundTime.current = Date.now();
      } else if (nextAppState === 'active') {
        if (!isLockEnabledRef.current) return;

        const elapsed = Date.now() - lastBackgroundTime.current;
        const timeout = autoLockTimeoutRef.current;

        // If app was sent to background and elapsed time >= timeout duration
        if (lastBackgroundTime.current > 0 && elapsed >= timeout) {
          setIsLocked(true);
          setTimeout(() => {
            unlock();
          }, 150);
        }
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );
    return () => {
      subscription.remove();
    };
  }, [unlock]);

  const toggleLock = useCallback(
    async (enable: boolean): Promise<boolean> => {
      // Must verify biometric identity to toggle the security switch
      const prompt = enable
        ? 'Verify identity to enable Biometric Lock'
        : 'Verify identity to disable Biometric Lock';

      setIsAuthenticating(true);
      const result = await authenticateWithBiometrics(prompt);
      setIsAuthenticating(false);

      if (result.success) {
        await setBiometricLockEnabled(enable);
        setIsLockEnabled(enable);
        if (!enable) {
          setIsLocked(false);
        }
        return true;
      } else {
        return false;
      }
    },
    []
  );

  const updateTimeout = useCallback(
    async (timeout: AutoLockTimeout): Promise<void> => {
      await persistAutoLockTimeout(timeout);
      setAutoLockTimeoutState(timeout);
    },
    []
  );

  const lock = useCallback(() => {
    setIsLocked(true);
  }, []);

  return (
    <BiometricContext.Provider
      value={{
        capabilities,
        isLockEnabled,
        autoLockTimeout,
        isLocked,
        isAuthenticating,
        lastError,
        toggleLock,
        updateTimeout,
        unlock,
        lock,
        refreshCapabilities,
      }}
    >
      {children}

      {isLocked && (
        <BiometricLockScreen
          onUnlock={unlock}
          isAuthenticating={isAuthenticating}
          supportedTypes={capabilities.supportedTypes}
          lastError={lastError}
        />
      )}
    </BiometricContext.Provider>
  );
};
