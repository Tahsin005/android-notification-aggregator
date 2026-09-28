import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

type EmptyStateType = 'no-permission' | 'no-notifications' | 'no-search-results' | 'no-apps';

interface EmptyStateProps {
  type: EmptyStateType;
  onPressAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, onPressAction }) => {
  const { colors } = useTheme();

  const config = {
    'no-permission': {
      icon: 'alert-circle-outline' as const,
      iconColor: colors.warning,
      title: 'Notification Access Required',
      description:
        'Enable Notification Access in Android settings to allow this app to capture and archive incoming notifications.',
      buttonLabel: 'Enable Notification Access',
    },
    'no-notifications': {
      icon: 'notifications-off-outline' as const,
      iconColor: colors.primary,
      title: 'No notifications archived',
      description:
        'Notifications from your apps will automatically stream and archive here once they arrive.',
      buttonLabel: undefined,
    },
    'no-search-results': {
      icon: 'search-outline' as const,
      iconColor: colors.textMuted,
      title: 'No matching notifications',
      description: 'We couldn’t find any notifications matching your query or selected filter.',
      buttonLabel: undefined,
    },
    'no-apps': {
      icon: 'apps-outline' as const,
      iconColor: colors.primary,
      title: 'No applications captured yet',
      description: 'Applications will appear here automatically as soon as they post their first notification.',
      buttonLabel: undefined,
    },
  }[type];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderColor: 'rgba(255, 255, 255, 0.10)',
            borderTopColor: 'rgba(255, 255, 255, 0.18)',
          },
        ]}
      >
        <Ionicons name={config.icon} size={32} color={config.iconColor} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{config.title}</Text>
      <Text style={[styles.description, { color: colors.textMuted }]}>{config.description}</Text>

      {config.buttonLabel && onPressAction ? (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onPressAction}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{config.buttonLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingVertical: 70,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
  },
  buttonText: {
    color: '#070A10',
    fontSize: 14,
    fontWeight: '700',
  },
});
