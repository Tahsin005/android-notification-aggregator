import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmbientBackground } from '../../components/AmbientBackground';
import { clearNotifications, getNotificationStats } from '../../database/repository';
import { useNotificationPermission } from '../../hooks/useNotificationPermission';
import { useTheme } from '../../hooks/useTheme';
import { notificationEvents } from '../../services/notificationEvents';
import { getRetentionSetting, saveRetentionSetting } from '../../services/retentionService';
import { NotificationStats, RetentionPeriod } from '../../types/notification';

const RETENTION_OPTIONS: { key: RetentionPeriod; label: string; description: string }[] = [
  { key: '7_days', label: '7 days', description: 'Automatically prune notifications older than a week' },
  { key: '30_days', label: '30 days', description: 'Automatically prune notifications older than a month' },
  { key: 'forever', label: 'Forever', description: 'Never delete notifications automatically' },
];

export default function SettingsScreen() {
  const { colors, isDark } = useTheme();
  const { isGranted, requestPermission } = useNotificationPermission();

  const [retention, setRetention] = useState<RetentionPeriod>('forever');
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const currentRetention = await getRetentionSetting();
      setRetention(currentRetention);

      const currentStats = await getNotificationStats();
      setStats(currentStats);
    } catch (e) {
      console.warn('Error loading settings data:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Subscribe to live mutation events across the app
  useEffect(() => {
    const unsubscribe = notificationEvents.subscribe(() => {
      loadData();
    });
    return unsubscribe;
  }, [loadData]);

  const handleSelectRetention = async (period: RetentionPeriod) => {
    setRetention(period);
    try {
      await saveRetentionSetting(period);
      const currentStats = await getNotificationStats();
      setStats(currentStats);
    } catch (e) {
      console.warn('Error saving retention setting:', e);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'This will permanently delete all stored notifications from your device. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              await clearNotifications();
              const currentStats = await getNotificationStats();
              setStats(currentStats);
              Alert.alert('Database Cleared', 'All notifications have been removed.');
            } catch {
              Alert.alert('Error', 'Failed to clear notifications.');
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AmbientBackground />

      <View style={[styles.header, { borderBottomColor: 'rgba(255, 255, 255, 0.07)' }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textDim }]}>NOTIFICATION ACCESS</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderTopColor: colors.cardBorderTop }]}>
            <View style={styles.statusRow}>
              <View style={styles.statusLeft}>
                <View
                  style={[
                    styles.statusIcon,
                    {
                      backgroundColor: isGranted ? 'rgba(52, 211, 153, 0.12)' : 'rgba(251, 191, 36, 0.12)',
                      borderColor: isGranted ? 'rgba(52, 211, 153, 0.25)' : 'rgba(251, 191, 36, 0.25)',
                    },
                  ]}
                >
                  <Ionicons
                    name={isGranted ? 'shield-checkmark' : 'alert-circle'}
                    size={22}
                    color={isGranted ? colors.success : colors.warning}
                  />
                </View>
                <View style={styles.statusTextContainer}>
                  <Text style={[styles.statusTitle, { color: colors.text }]}>
                    {isGranted ? 'Access Granted' : 'Access Required'}
                  </Text>
                  <Text style={[styles.statusSubtitle, { color: colors.textMuted }]}>
                    {isGranted
                      ? 'Listening for incoming notifications'
                      : 'Permission is needed to capture notifications'}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: isGranted ? colors.surface : colors.primary,
                  borderColor: isGranted ? colors.border : colors.primary,
                },
              ]}
              onPress={requestPermission}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  { color: isGranted ? colors.text : '#070A10' },
                ]}
              >
                {isGranted ? 'Manage Android Settings' : 'Enable Notification Access'}
              </Text>
              <Ionicons
                name="open-outline"
                size={16}
                color={isGranted ? colors.text : '#070A10'}
              />
            </TouchableOpacity>
          </View>
        </View>


        {stats && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textDim }]}>STATISTICS</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderTopColor: colors.cardBorderTop }]}>
                <Text style={[styles.statNum, { color: colors.text }]}>
                  {stats.totalCount.toLocaleString()}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textDim }]}>Total Stored</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderTopColor: colors.cardBorderTop }]}>
                <Text style={[styles.statNum, { color: colors.primary }]}>
                  {stats.unreadCount.toLocaleString()}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textDim }]}>Unread</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderTopColor: colors.cardBorderTop }]}>
                <Text style={[styles.statNum, { color: colors.success }]}>
                  {stats.todayCount.toLocaleString()}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textDim }]}>Today</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderTopColor: colors.cardBorderTop }]}>
                <Text style={[styles.statNum, { color: colors.accent2 }]}>
                  {stats.appsCount.toLocaleString()}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textDim }]}>Apps</Text>
              </View>
            </View>
          </View>
        )}


        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textDim }]}>DATA RETENTION</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderTopColor: colors.cardBorderTop }]}>
            {RETENTION_OPTIONS.map((opt, idx) => {
              const isSelected = retention === opt.key;
              const isLast = idx === RETENTION_OPTIONS.length - 1;

              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.radioItem,
                    !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255, 255, 255, 0.06)' },
                  ]}
                  onPress={() => handleSelectRetention(opt.key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioInfo}>
                    <Text style={[styles.radioLabel, { color: colors.text }]}>{opt.label}</Text>
                    <Text style={[styles.radioDescription, { color: colors.textMuted }]}>
                      {opt.description}
                    </Text>
                  </View>
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={22}
                    color={isSelected ? colors.primary : colors.textDim}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>


        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textDim }]}>MAINTENANCE</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderTopColor: colors.cardBorderTop }]}>
            <TouchableOpacity
              style={styles.clearRow}
              onPress={handleClearAll}
              disabled={isClearing}
              activeOpacity={0.7}
            >
              <View style={styles.clearLeft}>
                <View style={[styles.clearIconBox, { backgroundColor: colors.dangerLight }]}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </View>
                <View>
                  <Text style={[styles.clearText, { color: colors.danger }]}>
                    Clear All Notifications
                  </Text>
                  <Text style={[styles.clearSubtext, { color: colors.textDim }]}>
                    Permanently delete all stored notification records
                  </Text>
                </View>
              </View>
              {isClearing ? (
                <ActivityIndicator size="small" color={colors.danger} />
              ) : (
                <Ionicons name="chevron-forward" size={17} color={colors.textDim} />
              )}
            </TouchableOpacity>
          </View>
        </View>


        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textDim }]}>PRIVACY & ABOUT</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderTopColor: colors.cardBorderTop }]}>
            <TouchableOpacity
              style={styles.navRow}
              onPress={() => router.push('/privacy')}
              activeOpacity={0.7}
            >
              <View style={styles.navRowLeft}>
                <View style={[styles.privacyIconBox, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.navRowTitle, { color: colors.text }]}>Privacy Guarantee</Text>
                  <Text style={[styles.navRowSubtitle, { color: colors.textMuted }]}>
                    Your notifications never leave this device
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={17} color={colors.textDim} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.versionText, { color: colors.textDim }]}>
          Android Notification Aggregator • v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 130, // Generous padding to clear floating dock navigation
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statusRow: {
    padding: 16,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  statusSubtitle: {
    fontSize: 12.5,
    marginTop: 2,
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  radioInfo: {
    flex: 1,
    marginRight: 12,
  },
  radioLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  radioDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  clearLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  clearIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 15,
    fontWeight: '600',
  },
  clearSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  navRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  privacyIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navRowTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  navRowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11.5,
    marginTop: 8,
    marginBottom: 16,
  },
});
