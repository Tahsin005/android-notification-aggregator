import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { getAppsSummary } from '../../database/repository';
import { AppNotificationSummary } from '../../types/notification';
import { getAppColor, getAppInitials } from '../../utils/appColor';
import { EmptyState } from '../../components/EmptyState';

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadApps();
  };

  const handleAppPress = (app: AppNotificationSummary) => {
    router.navigate({
      pathname: '/',
      params: { package: app.package_name, appName: app.app_name },
    });
  };

  const renderAppItem = ({ item }: { item: AppNotificationSummary }) => {
    const appColor = getAppColor(item.package_name);
    const initials = getAppInitials(item.app_name);

    return (
      <TouchableOpacity
        style={[styles.appItem, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => handleAppPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: appColor.bg }]}>
          <Text style={[styles.avatarText, { color: appColor.text }]}>{initials}</Text>
        </View>

        <View style={styles.appInfo}>
          <Text style={[styles.appName, { color: colors.text }]} numberOfLines={1}>
            {item.app_name}
          </Text>
          <Text style={[styles.packageName, { color: colors.textMuted }]} numberOfLines={1}>
            {item.package_name}
          </Text>
        </View>

        <View style={styles.rightContainer}>
          <View style={[styles.countBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.countText, { color: colors.primary }]}>
              {item.count.toLocaleString()}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Apps</Text>
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
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
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
    gap: 8,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  appInfo: {
    flex: 1,
    marginRight: 8,
  },
  appName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  packageName: {
    fontSize: 12,
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
  },
  countText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
