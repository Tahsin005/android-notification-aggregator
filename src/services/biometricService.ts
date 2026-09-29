import * as LocalAuthentication from 'expo-local-authentication';
import { getSetting, setSetting } from '../database/repository';

export type AutoLockTimeout = 0 | 60000 | 300000; // Immediate, 1 min, 5 min

export interface BiometricCapabilities {
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: string[];
  canAuthenticate: boolean;
}

const SETTING_KEY_BIOMETRIC_ENABLED = 'biometric_lock_enabled';
const SETTING_KEY_AUTO_LOCK_TIMEOUT = 'biometric_auto_lock_timeout';

export async function getBiometricCapabilities(): Promise<BiometricCapabilities> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const authTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    const supportedTypes: string[] = [];
    if (authTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      supportedTypes.push('Fingerprint');
    }
    if (authTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      supportedTypes.push('Face Recognition');
    }
    if (authTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      supportedTypes.push('Iris');
    }

    return {
      hasHardware,
      isEnrolled,
      supportedTypes,
      canAuthenticate: hasHardware && isEnrolled,
    };
  } catch (error) {
    console.warn('Failed to query biometric capabilities:', error);
    return {
      hasHardware: false,
      isEnrolled: false,
      supportedTypes: [],
      canAuthenticate: false,
    };
  }
}

export async function authenticateWithBiometrics(
  promptMessage = 'Unlock Notification Vault'
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Cancel',
      disableDeviceFallback: false, // Allows device PIN/Pattern as fail-safe fallback
    });

    if (result.success) {
      return { success: true };
    }

    return {
      success: false,
      error: result.error,
    };
  } catch (error: any) {
    console.warn('Biometric authentication error:', error);
    return {
      success: false,
      error: error?.message || 'Authentication failed',
    };
  }
}

export async function isBiometricLockEnabled(): Promise<boolean> {
  try {
    const value = await getSetting(SETTING_KEY_BIOMETRIC_ENABLED, 'false');
    return value === 'true';
  } catch {
    return false;
  }
}

export async function setBiometricLockEnabled(enabled: boolean): Promise<void> {
  await setSetting(SETTING_KEY_BIOMETRIC_ENABLED, enabled ? 'true' : 'false');
}

export async function getAutoLockTimeout(): Promise<AutoLockTimeout> {
  try {
    const value = await getSetting(SETTING_KEY_AUTO_LOCK_TIMEOUT, '0');
    const parsed = parseInt(value, 10);
    if (parsed === 60000 || parsed === 300000) {
      return parsed as AutoLockTimeout;
    }
    return 0;
  } catch {
    return 0;
  }
}

export async function setAutoLockTimeout(timeout: AutoLockTimeout): Promise<void> {
  await setSetting(SETTING_KEY_AUTO_LOCK_TIMEOUT, timeout.toString());
}
