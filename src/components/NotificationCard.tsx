import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { NotificationItem } from '../types/notification';
import { formatRelativeTime } from '../utils/date';
import { getAppColor, getAppInitials } from '../utils/appColor';

interface NotificationCardProps {
  item: NotificationItem;
  onPress: (item: NotificationItem) => void;
  onToggleRead?: (key: string, isRead: boolean) => void;
  onDelete?: (key: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  item,
  onPress,
}) => {
  const { colors } = useTheme();
  const appColor = getAppColor(item.package_name);
  const initials = getAppInitials(item.app_name);
  const isUnread = item.is_read === 0;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isUnread ? colors.primaryLight : colors.border,
        },
      ]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.headerRow}>
        <View style={styles.appInfo}>
          <View style={[styles.avatar, { backgroundColor: appColor.bg }]}>
            <Text style={[styles.avatarText, { color: appColor.text }]}>{initials}</Text>
          </View>
          <Text style={[styles.appName, { color: colors.text }]} numberOfLines={1}>
            {item.app_name}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={[styles.timeText, { color: colors.textMuted }]}>
            {formatRelativeTime(item.timestamp)}
          </Text>
          {isUnread && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
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
        <Text
          style={[styles.body, { color: colors.textMuted }]}
          numberOfLines={2}
        >
          {item.text || item.big_text}
        </Text>
      ) : null}

      {(item.is_ongoing === 1 || item.removed_at != null || item.sub_text) && (
        <View style={styles.footerRow}>
          {item.sub_text ? (
            <Text style={[styles.subText, { color: colors.textMuted }]} numberOfLines={1}>
              {item.sub_text}
            </Text>
          ) : null}

          <View style={styles.tagsContainer}>
            {item.is_ongoing === 1 && (
              <View style={[styles.tag, { backgroundColor: colors.surface }]}>
                <Ionicons name="refresh-circle-outline" size={12} color={colors.textMuted} />
                <Text style={[styles.tagText, { color: colors.textMuted }]}>Ongoing</Text>
              </View>
            )}

            {item.removed_at != null && (
              <View style={[styles.tag, { backgroundColor: colors.surface }]}>
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
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '700',
  },
  appName: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 12,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    lineHeight: 19,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  subText: {
    fontSize: 12,
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
});
