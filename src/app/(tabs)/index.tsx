import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useNotificationPermission } from '../../hooks/useNotificationPermission';
import { useNotifications } from '../../hooks/useNotifications';
import { Header } from '../../components/Header';
import { SearchBar } from '../../components/SearchBar';
import { FilterBar } from '../../components/FilterBar';
import { NotificationCard } from '../../components/NotificationCard';
import { NotificationDetailModal } from '../../components/NotificationDetailModal';
import { EmptyState } from '../../components/EmptyState';
import { PermissionBanner } from '../../components/PermissionBanner';
import { AmbientBackground } from '../../components/AmbientBackground';
import { DateFilter, NotificationItem } from '../../types/notification';
import { groupNotificationsByDate } from '../../utils/date';

export default function ArchiveScreen() {
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams<{ package?: string; appName?: string }>();

  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [activeApp, setActiveApp] = useState<{ packageName: string; appName: string } | null>(
    params.package && params.appName
      ? { packageName: params.package, appName: params.appName }
      : null
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<NotificationItem | null>(null);

  const {
    isGranted,
    isSyncing,
    requestPermission,
    syncActiveNotifications,
  } = useNotificationPermission();

  const {
    notifications,
    unreadCount,
    isLoading,
    isRefreshing,
    hasMore,
    refresh,
    loadMore,
    deleteItem,
    toggleRead,
    markAllAsRead,
  } = useNotifications({
    filter: dateFilter,
    packageName: activeApp?.packageName,
    searchQuery,
  });

  const sections = useMemo(() => {
    return groupNotificationsByDate(notifications);
  }, [notifications]);

  const handleCardPress = (item: NotificationItem) => {
    setSelectedItem(item.is_read === 0 ? { ...item, is_read: 1 } : item);
    if (item.is_read === 0) {
      toggleRead(item.notification_key, false);
    }
  };

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionHeaderText, { color: colors.textDim }]}>{title.toUpperCase()}</Text>
    </View>
  );

  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (isGranted === false && notifications.length === 0) {
      return (
        <EmptyState
          type="no-permission"
          onPressAction={requestPermission}
        />
      );
    }

    if (searchQuery.trim().length > 0) {
      return <EmptyState type="no-search-results" />;
    }

    return <EmptyState type="no-notifications" />;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AmbientBackground />

      <Header
        isPermissionGranted={isGranted}
        onPressPermissionStatus={requestPermission}
        onPressRefresh={syncActiveNotifications}
        onPressMarkAllRead={unreadCount > 0 ? markAllAsRead : undefined}
        isSyncing={isSyncing}
        unreadCount={unreadCount}
      />

      {isGranted === false && (
        <PermissionBanner onEnablePress={requestPermission} />
      )}

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search app, title, or message..."
      />

      <FilterBar
        selectedFilter={dateFilter}
        onSelectFilter={setDateFilter}
        activeAppFilter={activeApp}
        onClearAppFilter={() => setActiveApp(null)}
        unreadCount={unreadCount}
      />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.notification_key}
        renderItem={({ item }) => (
          <NotificationCard
            item={item}
            onPress={handleCardPress}
            onToggleRead={toggleRead}
            onDelete={deleteItem}
          />
        )}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListFooterComponent={
          hasMore && notifications.length > 0 ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
      />

      <NotificationDetailModal
        item={selectedItem}
        visible={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        onToggleRead={toggleRead}
        onDelete={deleteItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 130, // Generous padding so last items clear floating dock
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  footerLoader: {
    paddingVertical: 18,
    alignItems: 'center',
  },
});
