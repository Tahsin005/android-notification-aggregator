import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface QuietVaultRatioProps {
  totalCount: number;
  dndCount: number;
  dndRatio: number;
  focusMinutesSaved: number;
}

export const QuietVaultRatio: React.FC<QuietVaultRatioProps> = ({
  totalCount,
  dndCount,
  dndRatio,
  focusMinutesSaved,
}) => {
  const { colors } = useTheme();

  const allowedCount = Math.max(0, totalCount - dndCount);
  const allowedRatio = 100 - dndRatio;

  const handleOpenSettings = () => {
    router.navigate('/settings');
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: 'rgba(250, 204, 21, 0.22)',
          borderTopColor: 'rgba(250, 204, 21, 0.40)',
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.titleWithIcon}>
          <View style={[styles.iconWrapper, { backgroundColor: 'rgba(250, 204, 21, 0.14)' }]}>
            <Ionicons name="moon" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Quiet Vault Peace Index</Text>
            <Text style={[styles.subtitle, { color: colors.textDim }]}>
              Do Not Disturb notification interception
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.settingsLink}
          onPress={handleOpenSettings}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.linkText, { color: colors.primary }]}>Configure</Text>
          <Ionicons name="arrow-forward" size={13} color={colors.primary} />
        </TouchableOpacity>
      </View>


      <View style={styles.barContainer}>
        <View
          style={[
            styles.splitBar,
            { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
          ]}
        >
          <View
            style={[
              styles.interceptedFill,
              {
                width: `${Math.max(dndRatio, totalCount > 0 && dndCount > 0 ? 5 : 0)}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.legendText, { color: colors.textMuted }]}>
              Vaulted: <Text style={{ color: colors.text, fontWeight: '700' }}>{dndCount}</Text>{' '}
              ({dndRatio}%)
            </Text>
          </View>

          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: 'rgba(255, 255, 255, 0.25)' },
              ]}
            />
            <Text style={[styles.legendText, { color: colors.textMuted }]}>
              Passed: <Text style={{ color: colors.text, fontWeight: '700' }}>{allowedCount}</Text>{' '}
              ({allowedRatio}%)
            </Text>
          </View>
        </View>
      </View>


      <View
        style={[
          styles.focusBanner,
          {
            backgroundColor: 'rgba(250, 204, 21, 0.08)',
            borderColor: 'rgba(250, 204, 21, 0.18)',
          },
        ]}
      >
        <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
        <Text style={[styles.focusBannerText, { color: colors.text }]}>
          Estimated{' '}
          <Text style={{ color: colors.primary, fontWeight: '800' }}>
            ~{focusMinutesSaved} minutes
          </Text>{' '}
          of uninterrupted focus preserved
        </Text>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  settingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '700',
  },
  barContainer: {
    marginBottom: 12,
  },
  splitBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  interceptedFill: {
    height: '100%',
    borderRadius: 4,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
  },
  focusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  focusBannerText: {
    fontSize: 12,
    flex: 1,
  },
});
