import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { AmbientBackground } from '../AmbientBackground';

interface BiometricLockScreenProps {
  onUnlock: () => void;
  isAuthenticating: boolean;
  supportedTypes: string[];
  lastError: string | null;
}

export const BiometricLockScreen: React.FC<BiometricLockScreenProps> = ({
  onUnlock,
  isAuthenticating,
  supportedTypes,
  lastError,
}) => {
  const { colors } = useTheme();

  const biometricLabel =
    supportedTypes.length > 0 ? supportedTypes.join(' / ') : 'Biometric Sensor';

  return (
    <View style={styles.overlay}>
      <StatusBar barStyle="light-content" />
      <AmbientBackground />

      <View style={styles.centerContainer}>

        <View style={styles.shieldGlowRing}>
          <View
            style={[
              styles.shieldCard,
              {
                backgroundColor: 'rgba(18, 21, 29, 0.92)',
                borderColor: 'rgba(250, 204, 21, 0.28)',
                borderTopColor: 'rgba(250, 204, 21, 0.50)',
              },
            ]}
          >
            <Ionicons name="lock-closed" size={38} color={colors.primary} />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Notification Vault</Text>

        <View style={styles.statusBadge}>
          <Text style={[styles.statusText, { color: colors.primary }]}>PROTECTED</Text>
        </View>

        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Verify your identity to access your private notifications and quiet vault.
        </Text>

        {lastError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={15} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.danger }]} numberOfLines={2}>
              {lastError}
            </Text>
          </View>
        ) : (
          <View style={styles.bioTypeBadge}>
            <Ionicons name="finger-print" size={14} color={colors.textDim} />
            <Text style={[styles.bioTypeText, { color: colors.textDim }]}>
              {biometricLabel}
            </Text>
          </View>
        )}


        <TouchableOpacity
          style={[
            styles.unlockButton,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
            },
          ]}
          onPress={onUnlock}
          activeOpacity={0.8}
          disabled={isAuthenticating}
        >
          {isAuthenticating ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <>
              <Ionicons name="finger-print-outline" size={20} color="#000000" />
              <Text style={styles.unlockButtonText}>Unlock Vault</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.fallbackHint, { color: colors.textDim }]}>
          Device PIN, pattern, or password can be used as fallback
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#060709',
    zIndex: 999999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    width: '85%',
    maxWidth: 360,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  shieldGlowRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(250, 204, 21, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.20)',
    marginBottom: 24,
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  shieldCard: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 8,
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.30)',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    borderColor: 'rgba(248, 113, 113, 0.25)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 24,
    maxWidth: '90%',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  bioTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 28,
  },
  bioTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  unlockButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },
  fallbackHint: {
    fontSize: 11,
    textAlign: 'center',
  },
});
