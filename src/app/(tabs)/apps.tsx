import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { getAppsSummary } from '../../database/repository';
import { AppNotificationSummary } from '../../types/notification';
import { resolveAppName } from '../../utils/appInfo';
import { AppIconBadge } from '../../components/AppIconBadge';
import { EmptyState } from '../../components/EmptyState';
import { AmbientBackground } from '../../components/AmbientBackground';
import { notificationEvents } from '../../services/notificationEvents';

export default function AppsScreen() {
  const { colors, isDark } = useTheme();
  const [apps, setApps] = useState<AppNotificationSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadApps = useCallback(async () => {
    try {
      const summary = await getAppsSummary();
      setApps(summary);
    } catch (e) {
      console.warn('Failed to load apps summary:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadApps();
    }, [loadApps])
  );

  // Subscribe to live mutation events
  useEffect(() => {
    const unsubscribe = notificationEvents.subscribe(() => {
      loadApps();
    });
    return unsubscribe;
  }, [loadApps]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadApps();
  };

  const handleAppPress = (app: AppNotificationSummary) => {
    const cleanName = resolveAppName(app.package_name, app.app_name);
    router.navigate({
      pathname: '/',
      params: { package: app.package_name, appName: cleanName },
    });
  };

  const renderAppItem = ({ item }: { item: AppNotificationSummary }) => {
    const cleanName = resolveAppName(item.package_name, item.app_name);

    return (
      <TouchableOpacity
        style={[
          styles.appItem,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            borderTopColor: colors.cardBorderTop,
          },
        ]}
        onPress={() => handleAppPress(item)}
        activeOpacity={0.75}
      >
        <AppIconBadge packageName={item.package_name} size={40} />

        <View style={styles.appInfo}>
          <Text style={[styles.appName, { color: colors.text }]} numberOfLines={1}>
            {cleanName}
          </Text>
          <Text style={[styles.packageName, { color: colors.textDim }]} numberOfLines={1}>
            {item.package_name}
          </Text>
        </View>

        <View style={styles.rightContainer}>
          <View style={[styles.countBadge, { backgroundColor: colors.primaryLight, borderColor: 'rgba(56, 189, 248, 0.25)' }]}>
            <Text style={[styles.countText, { color: colors.primary }]}>
              {item.count.toLocaleString()}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={17} color={colors.textDim} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AmbientBackground />

      <View style={[styles.header, { borderBottomColor: 'rgba(255, 255, 255, 0.07)' }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Applications</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {apps.length} {apps.length === 1 ? 'application' : 'applications'} archived
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={apps}
          keyExtractor={(item) => item.package_name}
          renderItem={renderAppItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState type="no-apps" />}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
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
  headerSubtitle: {
    fontSize: 13,
    marginTop: 3,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 130, // Avoid floating dock overlap
    gap: 9,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
  },
  appInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  appName: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  packageName: {
    fontSize: 11.5,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  countText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
});
