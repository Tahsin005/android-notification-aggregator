import { createContext, useContext } from 'react';
import {
  AutoLockTimeout,
  BiometricCapabilities,
} from '../services/biometricService';

export interface BiometricContextType {
  capabilities: BiometricCapabilities;
  isLockEnabled: boolean;
  autoLockTimeout: AutoLockTimeout;
  isLocked: boolean;
  isAuthenticating: boolean;
  lastError: string | null;
  toggleLock: (enabled: boolean) => Promise<boolean>;
  updateTimeout: (timeout: AutoLockTimeout) => Promise<void>;
  unlock: () => Promise<boolean>;
  lock: () => void;
  refreshCapabilities: () => Promise<void>;
}

export const BiometricContext = createContext<BiometricContextType | null>(null);

export function useBiometrics(): BiometricContextType {
  const context = useContext(BiometricContext);
  if (!context) {
    throw new Error('useBiometrics must be used within a BiometricProvider');
  }
  return context;
}
