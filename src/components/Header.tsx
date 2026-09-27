import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
  isPermissionGranted: boolean | null;
  onPressPermissionStatus?: () => void;
  onPressRefresh?: () => void;
  onPressMarkAllRead?: () => void;
  isSyncing?: boolean;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  isPermissionGranted,
  onPressPermissionStatus,
  onPressRefresh,
  onPressMarkAllRead,
  isSyncing,
  unreadCount = 0,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Notification Archive</Text>
          <TouchableOpacity
            style={[
              styles.statusBadge,
              {
                backgroundColor: isPermissionGranted ? colors.successLight : colors.warningLight,
                borderColor: isPermissionGranted ? colors.success : colors.warning,
              },
            ]}
            onPress={onPressPermissionStatus}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isPermissionGranted ? colors.success : colors.warning },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: isPermissionGranted ? colors.success : colors.warning },
              ]}
            >
              {isPermissionGranted === null
                ? 'Checking...'
                : isPermissionGranted
                ? 'Listening'
                : 'Access Required'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          {unreadCount > 0 && onPressMarkAllRead && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.surface }]}
              onPress={onPressMarkAllRead}
              accessibilityLabel="Mark all as read"
            >
              <Ionicons name="checkmark-done" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}

          {onPressRefresh && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.surface }]}
              onPress={onPressRefresh}
              disabled={isSyncing}
              accessibilityLabel="Refresh and sync"
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="sync-outline" size={20} color={colors.text} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
