import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { AppNotificationSummary } from '../../types/notification';
import { resolveAppName } from '../../utils/appInfo';
import { AppIconBadge } from '../AppIconBadge';

interface AppVolumeListProps {
  topApps: AppNotificationSummary[];
  totalCount: number;
}

export const AppVolumeList: React.FC<AppVolumeListProps> = ({ topApps, totalCount }) => {
  const { colors } = useTheme();

  if (topApps.length === 0) {
    return null;
  }

  const handleAppPress = (app: AppNotificationSummary) => {
    const cleanName = resolveAppName(app.package_name, app.app_name);
    router.navigate({
      pathname: '/',
      params: { package: app.package_name, appName: cleanName },
    });
  };

  const highestCount = topApps[0]?.count || 1;

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
          <Text style={[styles.title, { color: colors.text }]}>Top Source Apps</Text>
          <Text style={[styles.subtitle, { color: colors.textDim }]}>
            Tap any app to drill down in Archive
          </Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={16} color={colors.textDim} />
      </View>

      <View style={styles.list}>
        {topApps.map((app, index) => {
          const cleanName = resolveAppName(app.package_name, app.app_name);
          const percent = totalCount > 0 ? Math.round((app.count / totalCount) * 100) : 0;
          const relativeWidthPercent = Math.max(Math.round((app.count / highestCount) * 100), 5);

          return (
            <TouchableOpacity
              key={app.package_name}
              style={styles.appRow}
              onPress={() => handleAppPress(app)}
              activeOpacity={0.7}
            >
              <Text style={[styles.rankNumber, { color: colors.textDim }]}>
                {index + 1}
              </Text>

              <AppIconBadge packageName={app.package_name} size={36} />

              <View style={styles.appDetails}>
                <View style={styles.labelRow}>
                  <Text style={[styles.appName, { color: colors.text }]} numberOfLines={1}>
                    {cleanName}
                  </Text>
                  <Text style={[styles.countText, { color: colors.primary }]}>
                    {app.count}{' '}
                    <Text style={[styles.percentText, { color: colors.textDim }]}>
                      ({percent}%)
                    </Text>
                  </Text>
                </View>


                <View
                  style={[
                    styles.progressBarTrack,
                    { backgroundColor: 'rgba(255, 255, 255, 0.06)' },
                  ]}
                >
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${relativeWidthPercent}%`,
                        backgroundColor:
                          index === 0
                            ? colors.primary
                            : index === 1
                              ? '#FB923C'
                              : 'rgba(250, 204, 21, 0.50)',
                      },
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 14,
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
  list: {
    gap: 12,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: '700',
    width: 14,
    textAlign: 'center',
  },
  appDetails: {
    flex: 1,
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontSize: 13,
    fontWeight: '600',
    maxWidth: '65%',
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
  },
  percentText: {
    fontSize: 11,
    fontWeight: '400',
  },
  progressBarTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
