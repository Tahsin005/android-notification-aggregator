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

const FILTERS: { key: DateFilter; label: string; icon?: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'dnd', label: 'DND Vault', icon: 'moon' },
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
            style={[
              styles.chip,
              styles.activeAppChip,
              {
                backgroundColor: 'rgba(250, 204, 21, 0.18)',
                borderColor: 'rgba(250, 204, 21, 0.45)',
                borderTopColor: 'rgba(250, 204, 21, 0.65)',
              },
            ]}
            onPress={onClearAppFilter}
            activeOpacity={0.8}
          >
            <Text style={[styles.activeAppText, { color: colors.primary }]}>
              App: {activeAppFilter.appName}
            </Text>
            <Ionicons name="close" size={14} color={colors.primary} style={styles.closeIcon} />
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
                  backgroundColor: isSelected ? 'rgba(250, 204, 21, 0.16)' : 'rgba(255, 255, 255, 0.04)',
                  borderColor: isSelected ? 'rgba(250, 204, 21, 0.40)' : 'rgba(255, 255, 255, 0.08)',
                  borderTopColor: isSelected ? 'rgba(250, 204, 21, 0.65)' : 'rgba(255, 255, 255, 0.14)',
                },
              ]}
              onPress={() => onSelectFilter(f.key)}
              activeOpacity={0.7}
            >
              {f.icon && (
                <Ionicons
                  name={f.icon}
                  size={12}
                  color={isSelected ? colors.primary : colors.textMuted}
                  style={{ marginRight: 5 }}
                />
              )}
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isSelected ? colors.primary : colors.textMuted,
                    fontWeight: isSelected ? '700' : '500',
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
                      backgroundColor: isSelected ? colors.primary : 'rgba(250, 204, 21, 0.25)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: isSelected ? '#070A10' : colors.primary },
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
    marginVertical: 4,
  },
  container: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
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
    fontSize: 12.5,
    letterSpacing: 0.1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  activeAppChip: {
    borderStyle: 'dashed',
  },
  activeAppText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  closeIcon: {
    marginLeft: 2,
  },
});
