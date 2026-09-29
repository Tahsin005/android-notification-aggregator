import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { DayOfWeekStatItem } from '../../types/notification';

interface DayOfWeekChartProps {
  dayOfWeek: DayOfWeekStatItem[];
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DayOfWeekChart: React.FC<DayOfWeekChartProps> = ({ dayOfWeek }) => {
  const { colors } = useTheme();

  const maxCount = Math.max(...dayOfWeek.map((d) => d.count), 1);
  const peakDay = dayOfWeek.reduce(
    (max, cur) => (cur.count > max.count ? cur : max),
    { day: 0, count: 0 }
  );

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
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Weekly Distribution</Text>
          <Text style={[styles.subtitle, { color: colors.textDim }]}>
            Day-of-week notification volume
          </Text>
        </View>

        {peakDay.count > 0 && (
          <View
            style={[
              styles.peakBadge,
              {
                backgroundColor: 'rgba(250, 204, 21, 0.14)',
                borderColor: 'rgba(250, 204, 21, 0.35)',
              },
            ]}
          >
            <Text style={[styles.peakBadgeText, { color: colors.primary }]}>
              Busiest: {DAY_NAMES[peakDay.day]} ({peakDay.count})
            </Text>
          </View>
        )}
      </View>

      <View style={styles.chartCanvas}>
        {dayOfWeek.map((item) => {
          const isPeak = item.day === peakDay.day && peakDay.count > 0;
          const heightPercent =
            item.count === 0 ? 5 : Math.max((item.count / maxCount) * 100, 10);

          return (
            <View key={item.day} style={styles.dayColumn}>
              <Text
                style={[
                  styles.countLabel,
                  { color: isPeak ? colors.primary : colors.textDim },
                ]}
              >
                {item.count > 0 ? item.count : ''}
              </Text>

              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${heightPercent}%`,
                      backgroundColor: isPeak
                        ? colors.primary
                        : item.count > 0
                        ? 'rgba(250, 204, 21, 0.40)'
                        : 'rgba(255, 255, 255, 0.08)',
                    },
                    isPeak && styles.peakGlow,
                  ]}
                />
              </View>

              <Text
                style={[
                  styles.dayLabel,
                  {
                    color: isPeak ? colors.primary : colors.textMuted,
                    fontWeight: isPeak ? '700' : '500',
                  },
                ]}
              >
                {DAY_NAMES[item.day]}
              </Text>
            </View>
          );
        })}
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
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  peakBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  peakBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chartCanvas: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 110,
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  countLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    height: 12,
  },
  barTrack: {
    width: 22,
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: '100%',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  peakGlow: {
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 3,
  },
  dayLabel: {
    fontSize: 11,
    marginTop: 6,
  },
});
