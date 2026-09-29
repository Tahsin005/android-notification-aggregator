import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { AnalyticsTimeRange } from '../../types/notification';

interface TimeRangeSelectorProps {
  selected: AnalyticsTimeRange;
  onSelect: (range: AnalyticsTimeRange) => void;
}

const RANGES: { key: AnalyticsTimeRange; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: 'all', label: 'All Time' },
];

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ selected, onSelect }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.pillWrapper,
          {
            backgroundColor: 'rgba(16, 19, 26, 0.85)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          },
        ]}
      >
        {RANGES.map((item) => {
          const isSelected = selected === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.pill,
                isSelected && [
                  styles.activePill,
                  {
                    backgroundColor: 'rgba(250, 204, 21, 0.16)',
                    borderColor: 'rgba(250, 204, 21, 0.40)',
                  },
                ],
              ]}
              onPress={() => onSelect(item.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: isSelected ? colors.primary : colors.textDim },
                  isSelected && styles.activePillText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  pillWrapper: {
    flexDirection: 'row',
    borderRadius: 22,
    borderWidth: 1,
    padding: 4,
    justifyContent: 'space-between',
  },
  pill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activePill: {
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  activePillText: {
    fontWeight: '700',
  },
});
