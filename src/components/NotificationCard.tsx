import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { NotificationItem } from '../types/notification';
import { formatRelativeTime } from '../utils/date';
import { resolveAppName } from '../utils/appInfo';
import { AppIconBadge } from './AppIconBadge';

interface NotificationCardProps {
  item: NotificationItem;
  onPress: (item: NotificationItem) => void;
  onToggleRead?: (key: string, isRead: boolean) => void;
  onDelete?: (key: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  item,
  onPress,
  onToggleRead,
  onDelete,
}) => {
  const { colors } = useTheme();
  const displayName = resolveAppName(item.package_name, item.app_name);
  const isUnread = item.is_read === 0;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isUnread ? 'rgba(250, 204, 21, 0.32)' : colors.cardBorder,
          borderTopColor: isUnread ? 'rgba(250, 204, 21, 0.55)' : colors.cardBorderTop,
        },
      ]}
      onPress={() => onPress(item)}
      activeOpacity={0.75}
    >
      <View style={styles.headerRow}>
        <View style={styles.appInfo}>
          <AppIconBadge packageName={item.package_name} size={34} />
          <View style={styles.appTitleColumn}>
            <Text style={[styles.appName, { color: colors.text }]} numberOfLines={1}>
              {displayName}
            </Text>
            {item.package_name !== displayName && (
              <Text style={[styles.packageSub, { color: colors.textDim }]} numberOfLines={1}>
                {item.package_name}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.metaRow}>
          {item.intercepted_in_dnd === 1 && (
            <View style={[styles.dndBadge, { backgroundColor: 'rgba(250, 204, 21, 0.12)', borderColor: 'rgba(250, 204, 21, 0.35)' }]}>
              <Ionicons name="moon" size={9} color={colors.primary} />
              <Text style={[styles.dndBadgeText, { color: colors.primary }]}>DND</Text>
            </View>
          )}
          {isUnread && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
          <Text style={[styles.timeText, { color: colors.textMuted }]}>
            {formatRelativeTime(item.timestamp)}
          </Text>

          <View style={styles.actionGroup}>
            {onToggleRead && (
              <TouchableOpacity
                onPress={() => onToggleRead(item.notification_key, !isUnread)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={[styles.actionIconBtn, { backgroundColor: colors.surface }]}
                accessibilityLabel={isUnread ? 'Mark as read' : 'Mark as unread'}
              >
                <Ionicons
                  name={isUnread ? 'mail-unread' : 'mail-outline'}
                  size={15}
                  color={isUnread ? colors.primary : colors.textMuted}
                />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                onPress={() => onDelete(item.notification_key)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={[styles.actionIconBtn, { backgroundColor: colors.surface }]}
                accessibilityLabel="Delete notification"
              >
                <Ionicons name="trash-outline" size={15} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {item.title ? (
        <Text
          style={[styles.title, { color: colors.text, fontWeight: isUnread ? '700' : '600' }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
      ) : null}

      {item.text || item.big_text ? (
        <Text style={[styles.body, { color: colors.textMuted }]} numberOfLines={2}>
          {item.text || item.big_text}
        </Text>
      ) : null}

      {(item.is_ongoing === 1 || item.removed_at != null || item.sub_text) && (
        <View style={[styles.footerRow, { borderTopColor: 'rgba(255, 255, 255, 0.06)' }]}>
          {item.sub_text ? (
            <Text style={[styles.subText, { color: colors.textDim }]} numberOfLines={1}>
              {item.sub_text}
            </Text>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          <View style={styles.tagsContainer}>
            {item.is_ongoing === 1 && (
              <View style={[styles.tag, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="sync-circle-outline" size={12} color={colors.textMuted} />
                <Text style={[styles.tagText, { color: colors.textMuted }]}>Ongoing</Text>
              </View>
            )}

            {item.removed_at != null && (
              <View style={[styles.tag, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="checkmark-circle-outline" size={12} color={colors.textMuted} />
                <Text style={[styles.tagText, { color: colors.textMuted }]}>Dismissed</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 15,
    marginHorizontal: 16,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    gap: 10,
  },
  appTitleColumn: {
    flex: 1,
  },
  appName: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  packageSub: {
    fontSize: 11,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginLeft: 2,
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 13.5,
    lineHeight: 19,
    letterSpacing: -0.1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  subText: {
    fontSize: 11.5,
    fontStyle: 'italic',
    flex: 1,
    marginRight: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  tagText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  dndBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    gap: 3,
    marginRight: 4,
  },
  dndBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
