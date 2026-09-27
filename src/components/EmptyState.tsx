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
      iconColor: colors.textMuted,
      title: 'No notifications yet',
      description:
        'Notifications from your apps will appear here once they arrive. Make sure Notification Access is enabled.',
      buttonLabel: undefined,
    },
    'no-search-results': {
      icon: 'search-outline' as const,
      iconColor: colors.textMuted,
      title: 'No matching notifications',
      description: 'We couldn’t find any notifications matching your search or active filter.',
      buttonLabel: undefined,
    },
    'no-apps': {
      icon: 'apps-outline' as const,
      iconColor: colors.textMuted,
      title: 'No applications captured yet',
      description: 'Apps will show up here as soon as they post their first notification.',
      buttonLabel: undefined,
    },
  }[type];

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
        <Ionicons name={config.icon} size={36} color={config.iconColor} />
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
    paddingVertical: 60,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
