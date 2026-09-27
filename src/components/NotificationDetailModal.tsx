import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { launchApp } from '../services/notificationService';
import { NotificationItem } from '../types/notification';
import { getAppColor, getAppInitials } from '../utils/appColor';
import { formatFullDateTime } from '../utils/date';

interface NotificationDetailModalProps {
  item: NotificationItem | null;
  visible: boolean;
  onClose: () => void;
  onToggleRead: (key: string, isRead: boolean) => void;
  onDelete: (key: string) => void;
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  item,
  visible,
  onClose,
  onToggleRead,
  onDelete,
}) => {
  const { colors } = useTheme();
  const [isOpeningApp, setIsOpeningApp] = useState(false);

  if (!item) return null;

  const appColor = getAppColor(item.package_name);
  const initials = getAppInitials(item.app_name);
  const isRead = item.is_read === 1;

  const handleOpenApp = async () => {
    setIsOpeningApp(true);
    try {
      const opened = await launchApp(item.package_name);
      if (!opened) {
        const msg = `Unable to open ${item.app_name}. The app may not have a standard launcher activity.`;
        if (Platform.OS === 'android') {
          ToastAndroid.show(msg, ToastAndroid.LONG);
        } else {
          Alert.alert('Cannot Open App', msg);
        }
      } else {
        onClose();
      }
    } finally {
      setIsOpeningApp(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Notification', 'Are you sure you want to remove this notification?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onDelete(item.notification_key);
          onClose();
        },
      },
    ]);
  };

  const handleToggleRead = () => {
    onToggleRead(item.notification_key, isRead);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>

          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.appHeader}>
              <View style={[styles.avatar, { backgroundColor: appColor.bg }]}>
                <Text style={[styles.avatarText, { color: appColor.text }]}>{initials}</Text>
              </View>
              <View style={styles.appTitleBox}>
                <Text style={[styles.appName, { color: colors.text }]} numberOfLines={1}>
                  {item.app_name}
                </Text>
                <Text style={[styles.packageName, { color: colors.textMuted }]} numberOfLines={1}>
                  {item.package_name}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.surface }]}
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>


          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {item.title ? (
              <Text style={[styles.contentTitle, { color: colors.text }]} selectable>
                {item.title}
              </Text>
            ) : null}

            {item.text || item.big_text ? (
              <Text style={[styles.contentText, { color: colors.text }]} selectable>
                {item.big_text || item.text}
              </Text>
            ) : null}

            {item.sub_text ? (
              <View style={[styles.subTextBox, { backgroundColor: colors.surface }]}>
                <Text style={[styles.subTextLabel, { color: colors.textMuted }]}>Subtext: </Text>
                <Text style={[styles.subTextVal, { color: colors.text }]}>{item.sub_text}</Text>
              </View>
            ) : null}


            <View style={[styles.metaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.metaHeader, { color: colors.textMuted }]}>DETAILS</Text>

              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Timestamp</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>
                  {formatFullDateTime(item.timestamp)}
                </Text>
              </View>

              {item.channel_id ? (
                <View style={styles.metaRow}>
                  <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Channel</Text>
                  <Text style={[styles.metaValue, { color: colors.text }]}>{item.channel_id}</Text>
                </View>
              ) : null}

              {item.category ? (
                <View style={styles.metaRow}>
                  <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Category</Text>
                  <Text style={[styles.metaValue, { color: colors.text }]}>{item.category}</Text>
                </View>
              ) : null}

              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Status</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>
                  {isRead ? 'Read' : 'Unread'}
                  {item.is_ongoing === 1 ? ' • Ongoing' : ''}
                  {item.removed_at ? ' • Dismissed' : ''}
                </Text>
              </View>
            </View>
          </ScrollView>


          <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleOpenApp}
              disabled={isOpeningApp}
            >
              <Ionicons name="open-outline" size={18} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Open App</Text>
            </TouchableOpacity>

            <View style={styles.secondaryActions}>
              <TouchableOpacity
                style={[styles.secondaryButton, { backgroundColor: colors.surface }]}
                onPress={handleToggleRead}
              >
                <Ionicons
                  name={isRead ? 'mail-outline' : 'mail-open-outline'}
                  size={18}
                  color={colors.text}
                />
                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                  {isRead ? 'Mark Unread' : 'Mark Read'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dangerButton, { backgroundColor: colors.dangerLight }]}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
                <Text style={[styles.dangerButtonText, { color: colors.danger }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
  },
  appTitleBox: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
  },
  packageName: {
    fontSize: 11,
    marginTop: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 10,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  subTextBox: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  subTextLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  subTextVal: {
    fontSize: 13,
    flex: 1,
  },
  metaCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    gap: 10,
  },
  metaHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'right',
    flex: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dangerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    gap: 6,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
