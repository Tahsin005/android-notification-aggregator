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
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>Notification Archive</Text>
            {unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.primaryLight, borderColor: 'rgba(250, 204, 21, 0.35)' }]}>
                <Text style={[styles.unreadBadgeText, { color: colors.primary }]}>{unreadCount}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.statusBadge,
              {
                backgroundColor: isPermissionGranted ? 'rgba(52, 211, 153, 0.10)' : 'rgba(251, 191, 36, 0.12)',
                borderColor: isPermissionGranted ? 'rgba(52, 211, 153, 0.25)' : 'rgba(251, 191, 36, 0.28)',
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
                ? 'Connecting...'
                : isPermissionGranted
                ? 'Live Monitoring'
                : 'Access Required'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          {unreadCount > 0 && onPressMarkAllRead && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: 'rgba(255, 255, 255, 0.10)' }]}
              onPress={onPressMarkAllRead}
              accessibilityLabel="Mark all as read"
            >
              <Ionicons name="checkmark-done" size={17} color={colors.primary} />
            </TouchableOpacity>
          )}

          {onPressRefresh && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: 'rgba(255, 255, 255, 0.10)' }]}
              onPress={onPressRefresh}
              disabled={isSyncing}
              accessibilityLabel="Refresh and sync"
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="sync-outline" size={17} color={colors.text} />
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
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
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  unreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
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
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
