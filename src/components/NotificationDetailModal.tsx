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
import { resolveAppName } from '../utils/appInfo';
import { formatFullDateTime } from '../utils/date';
import { AppIconBadge } from './AppIconBadge';

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
  const [prevItemKey, setPrevItemKey] = useState<string | null>(null);
  const [readOverride, setReadOverride] = useState<boolean | null>(null);

  if (item && item.notification_key !== prevItemKey) {
    setPrevItemKey(item.notification_key);
    setReadOverride(null);
  }

  const isRead = readOverride !== null ? readOverride : (item ? item.is_read === 1 : false);

  if (!item) return null;

  const displayName = resolveAppName(item.package_name, item.app_name);

  const handleOpenApp = async () => {
    setIsOpeningApp(true);
    try {
      const opened = await launchApp(item.package_name);
      if (!opened) {
        const msg = `Unable to open ${displayName}. Please verify the app is installed.`;
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
    const wasRead = isRead;
    setReadOverride(!wasRead);
    onToggleRead(item.notification_key, wasRead);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.glassPanel,
              borderColor: colors.glassPanelBorder,
            },
          ]}
        >

          <View style={[styles.header, { borderBottomColor: 'rgba(255, 255, 255, 0.08)' }]}>
            <View style={styles.appHeader}>
              <AppIconBadge packageName={item.package_name} size={42} />
              <View style={styles.appTitleBox}>
                <Text style={[styles.appName, { color: colors.text }]} numberOfLines={1}>
                  {displayName}
                </Text>
                <Text style={[styles.packageName, { color: colors.textDim }]} numberOfLines={1}>
                  {item.package_name}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.surface }]}
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>


          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {item.title ? (
              <Text style={[styles.contentTitle, { color: colors.text }]} selectable>
                {item.title}
              </Text>
            ) : null}

            {item.text || item.big_text ? (
              <Text style={[styles.contentText, { color: colors.textMuted }]} selectable>
                {item.big_text || item.text}
              </Text>
            ) : null}

            {item.sub_text ? (
              <View style={[styles.subTextBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.subTextLabel, { color: colors.textDim }]}>Subtext: </Text>
                <Text style={[styles.subTextVal, { color: colors.text }]}>{item.sub_text}</Text>
              </View>
            ) : null}


            <View style={[styles.metaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.metaHeader, { color: colors.textDim }]}>DETAILS</Text>

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


          <View style={[styles.footer, { borderTopColor: 'rgba(255, 255, 255, 0.08)', backgroundColor: colors.glassPanel }]}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleOpenApp}
              disabled={isOpeningApp}
            >
              <Ionicons name="open-outline" size={18} color="#070A10" />
              <Text style={styles.primaryButtonText}>Open App</Text>
            </TouchableOpacity>

            <View style={styles.secondaryActions}>
              <TouchableOpacity
                style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={handleToggleRead}
              >
                <Ionicons
                  name={isRead ? 'mail-outline' : 'mail-open-outline'}
                  size={17}
                  color={colors.text}
                />
                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                  {isRead ? 'Mark Unread' : 'Mark Read'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dangerButton, { backgroundColor: colors.dangerLight, borderColor: 'rgba(248, 113, 113, 0.25)' }]}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={17} color={colors.danger} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.70)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.20)',
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  appTitleBox: {
    marginLeft: 12,
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  packageName: {
    fontSize: 11.5,
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
    gap: 16,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 24,
  },
  contentText: {
    fontSize: 14.5,
    lineHeight: 22,
  },
  subTextBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  subTextLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  subTextVal: {
    fontSize: 12,
    flex: 1,
  },
  metaCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  metaHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 13,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    gap: 8,
  },
  primaryButtonText: {
    color: '#070A10',
    fontSize: 15,
    fontWeight: '700',
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
    borderWidth: 1,
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  dangerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  dangerButtonText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
});
