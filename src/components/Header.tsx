import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
  isPermissionGranted: boolean | null;
  onPressPermissionStatus?: () => void;
  onPressRefresh?: () => void;
  onPressMarkAllRead?: () => void;
  isSyncing?: boolean;
  unreadCount?: number;
  isDnd?: boolean;
  onToggleDnd?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isPermissionGranted,
  onPressPermissionStatus,
  onPressRefresh,
  onPressMarkAllRead,
  isSyncing,
  unreadCount = 0,
  isDnd = false,
  onToggleDnd,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>

      <View style={styles.titleRow}>
        <View style={styles.titleWithBadge}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            Notification Archive
          </Text>
          {unreadCount > 0 && (
            <View
              style={[
                styles.unreadBadge,
                { backgroundColor: colors.primaryLight, borderColor: 'rgba(250, 204, 21, 0.35)' },
              ]}
            >
              <Text style={[styles.unreadBadgeText, { color: colors.primary }]}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.headerActions}>
          {unreadCount > 0 && onPressMarkAllRead && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: 'rgba(255, 255, 255, 0.08)' }]}
              onPress={onPressMarkAllRead}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityLabel="Mark all as read"
            >
              <Ionicons name="checkmark-done" size={17} color={colors.primary} />
            </TouchableOpacity>
          )}

          {onPressRefresh && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: 'rgba(255, 255, 255, 0.08)' }]}
              onPress={onPressRefresh}
              disabled={isSyncing}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityLabel="Refresh and sync"
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="sync-outline" size={16} color={colors.text} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>


      <View style={styles.subRow}>
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
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
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

        {onToggleDnd && (
          <TouchableOpacity
            style={[
              styles.dndButton,
              isDnd
                ? {
                  backgroundColor: 'rgba(250, 204, 21, 0.16)',
                  borderColor: 'rgba(250, 204, 21, 0.40)',
                }
                : {
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                },
            ]}
            onPress={onToggleDnd}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessibilityLabel={isDnd ? 'Do Not Disturb Active' : 'Toggle Do Not Disturb'}
          >
            <Ionicons
              name={isDnd ? 'moon' : 'moon-outline'}
              size={13}
              color={isDnd ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.dndButtonText,
                { color: isDnd ? colors.primary : colors.textMuted },
              ]}
            >
              {isDnd ? 'DND ON' : 'DND'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
  },
  titleWithBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  unreadBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 9,
    borderWidth: 1,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 35,
    height: 35,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 28,
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
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dndButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    gap: 5,
  },
  dndButtonText: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
