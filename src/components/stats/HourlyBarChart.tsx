import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { HourlyStatItem } from '../../types/notification';

interface HourlyBarChartProps {
  hourly: HourlyStatItem[];
}

export const HourlyBarChart: React.FC<HourlyBarChartProps> = ({ hourly }) => {
  const { colors } = useTheme();

  // Find max count and peak hour
  const maxCount = Math.max(...hourly.map((h) => h.count), 1);
  const peakItem = hourly.reduce(
    (max, cur) => (cur.count > max.count ? cur : max),
    { hour: 0, count: 0 }
  );

  const [selectedHour, setSelectedHour] = useState<number | null>(
    peakItem.count > 0 ? peakItem.hour : null
  );

  const formatHourLabel = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const activeHour = selectedHour !== null ? selectedHour : peakItem.hour;
  const activeCount = hourly[activeHour]?.count ?? 0;
  const isPeakSelected = activeHour === peakItem.hour && peakItem.count > 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          borderTopColor: colors.cardBorderTop,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={[styles.title, { color: colors.text }]}>24-Hour Distribution</Text>
          <Text style={[styles.subtitle, { color: colors.textDim }]}>
            Peak activity and hourly volume
          </Text>
        </View>


        <View
          style={[
            styles.tooltipPill,
            {
              backgroundColor: isPeakSelected
                ? 'rgba(250, 204, 21, 0.16)'
                : 'rgba(255, 255, 255, 0.06)',
              borderColor: isPeakSelected
                ? 'rgba(250, 204, 21, 0.40)'
                : 'rgba(255, 255, 255, 0.12)',
            },
          ]}
        >
          <Ionicons
            name={isPeakSelected ? 'flash' : 'time-outline'}
            size={13}
            color={isPeakSelected ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.tooltipText,
              { color: isPeakSelected ? colors.primary : colors.text },
            ]}
          >
            {formatHourLabel(activeHour)}: {activeCount}{' '}
            {activeCount === 1 ? 'msg' : 'msgs'}
            {isPeakSelected ? ' (Peak)' : ''}
          </Text>
        </View>
      </View>


      <View style={styles.chartCanvas}>
        {hourly.map((item) => {
          const isSelected = selectedHour === item.hour;
          const isPeak = item.hour === peakItem.hour && peakItem.count > 0;
          const heightPercent =
            item.count === 0 ? 4 : Math.max((item.count / maxCount) * 100, 8);

          return (
            <TouchableOpacity
              key={item.hour}
              style={styles.barColumn}
              activeOpacity={0.7}
              onPress={() => setSelectedHour(item.hour)}
            >
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${heightPercent}%`,
                      backgroundColor: isSelected
                        ? colors.primary
                        : isPeak
                          ? '#FBBF24'
                          : item.count > 0
                            ? 'rgba(250, 204, 21, 0.40)'
                            : 'rgba(255, 255, 255, 0.08)',
                    },
                    isSelected && styles.selectedBarGlow,
                  ]}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>


      <View style={styles.axisRow}>
        <Text style={[styles.axisLabel, { color: colors.textDim }]}>12a</Text>
        <Text style={[styles.axisLabel, { color: colors.textDim }]}>4a</Text>
        <Text style={[styles.axisLabel, { color: colors.textDim }]}>8a</Text>
        <Text style={[styles.axisLabel, { color: colors.textDim }]}>12p</Text>
        <Text style={[styles.axisLabel, { color: colors.textDim }]}>4p</Text>
        <Text style={[styles.axisLabel, { color: colors.textDim }]}>8p</Text>
        <Text style={[styles.axisLabel, { color: colors.textDim }]}>11p</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleGroup: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  tooltipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  tooltipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chartCanvas: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 110,
    paddingTop: 10,
    gap: 2,
  },
  barColumn: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barTrack: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: '85%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
  },
  selectedBarGlow: {
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  axisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  axisLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});
