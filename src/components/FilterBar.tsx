import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { DateFilter } from '../types/notification';

interface FilterBarProps {
  selectedFilter: DateFilter;
  onSelectFilter: (filter: DateFilter) => void;
  activeAppFilter?: { packageName: string; appName: string } | null;
  onClearAppFilter?: () => void;
  unreadCount?: number;
}

const FILTERS: { key: DateFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedFilter,
  onSelectFilter,
  activeAppFilter,
  onClearAppFilter,
  unreadCount = 0,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {activeAppFilter && (
          <TouchableOpacity
            style={[styles.chip, styles.activeAppChip, { backgroundColor: colors.primary }]}
            onPress={onClearAppFilter}
            activeOpacity={0.8}
          >
            <Text style={styles.activeAppText}>App: {activeAppFilter.appName}</Text>
            <Ionicons name="close" size={14} color="#FFFFFF" style={styles.closeIcon} />
          </TouchableOpacity>
        )}

        {FILTERS.map((f) => {
          const isSelected = selectedFilter === f.key && !activeAppFilter;
          const showBadge = f.key === 'unread' && unreadCount > 0;

          return (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => onSelectFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isSelected ? '#FFFFFF' : colors.text,
                    fontWeight: isSelected ? '600' : '500',
                  },
                ]}
              >
                {f.label}
              </Text>
              {showBadge && (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: isSelected ? '#FFFFFF' : colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: isSelected ? colors.primary : '#FFFFFF' },
                    ]}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 6,
  },
  container: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  activeAppChip: {
    borderWidth: 0,
    paddingRight: 10,
  },
  activeAppText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  closeIcon: {
    marginLeft: 2,
  },
});
