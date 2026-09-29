import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AmbientBackground } from '../../components/AmbientBackground';
import { EmptyState } from '../../components/EmptyState';
import { AppVolumeList } from '../../components/stats/AppVolumeList';
import { DayOfWeekChart } from '../../components/stats/DayOfWeekChart';
import { HourlyBarChart } from '../../components/stats/HourlyBarChart';
import { QuietVaultRatio } from '../../components/stats/QuietVaultRatio';
import { StatKpiCard } from '../../components/stats/StatKpiCard';
import { TimeRangeSelector } from '../../components/stats/TimeRangeSelector';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useTheme } from '../../hooks/useTheme';

export default function StatsScreen() {
  const { colors, isDark } = useTheme();
  const {
    timeRange,
    setTimeRange,
    data,
    peakHour,
    busiestApp,
    dndRatio,
    focusMinutesSaved,
    isLoading,
    isRefreshing,
    refresh,
  } = useAnalytics('today');

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const formatHourString = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AmbientBackground />

      <SafeAreaView style={styles.safeArea} edges={['top']}>

        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Analytics & Insights</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textDim }]}>
              Volume trends, sources & focus impact
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.refreshButton,
              {
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                borderColor: 'rgba(255, 255, 255, 0.10)',
              },
            ]}
            onPress={refresh}
            activeOpacity={0.7}
            disabled={isRefreshing || isLoading}
            accessibilityLabel="Refresh analytics data"
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="refresh" size={18} color={colors.textMuted} />
            )}
          </TouchableOpacity>
        </View>


        <TimeRangeSelector selected={timeRange} onSelect={setTimeRange} />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              Aggregating notification metrics...
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          >
            {data.totalCount === 0 ? (
              <View style={styles.emptyContainer}>
                <EmptyState
                  type="no-stats"
                />
              </View>
            ) : (
              <>

                <View style={styles.kpiGrid}>
                  <View style={styles.kpiRow}>
                    <StatKpiCard
                      icon="notifications"
                      title="Received"
                      value={data.totalCount}
                      subtitle={`${data.unreadCount} unread`}
                      accent
                    />
                    <StatKpiCard
                      icon="moon"
                      iconColor="#F59E0B"
                      iconBg="rgba(245, 158, 11, 0.14)"
                      title="Quiet Vaulted"
                      value={data.dndCount}
                      subtitle={`${dndRatio}% intercepted`}
                    />
                  </View>

                  <View style={styles.kpiRow}>
                    <StatKpiCard
                      icon="flash"
                      iconColor="#FB923C"
                      iconBg="rgba(251, 146, 60, 0.14)"
                      title="Peak Hour"
                      value={peakHour.count > 0 ? formatHourString(peakHour.hour) : '—'}
                      subtitle={peakHour.count > 0 ? `${peakHour.count} notifications` : 'Low activity'}
                    />
                    <StatKpiCard
                      icon="apps"
                      iconColor="#38BDF8"
                      iconBg="rgba(56, 189, 248, 0.14)"
                      title="Top Source"
                      value={busiestApp ? busiestApp.app_name : '—'}
                      subtitle={busiestApp ? `${busiestApp.count} notifications` : '0 apps'}
                    />
                  </View>
                </View>


                <HourlyBarChart hourly={data.hourly} />


                <QuietVaultRatio
                  totalCount={data.totalCount}
                  dndCount={data.dndCount}
                  dndRatio={dndRatio}
                  focusMinutesSaved={focusMinutesSaved}
                />


                <AppVolumeList topApps={data.topApps} totalCount={data.totalCount} />


                <DayOfWeekChart dayOfWeek={data.dayOfWeek} />
              </>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110, // Generous clearance for floating dock
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
  },
  emptyContainer: {
    marginTop: 40,
    paddingHorizontal: 24,
  },
  kpiGrid: {
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
