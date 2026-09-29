import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface StatKpiCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: boolean;
}

export const StatKpiCard: React.FC<StatKpiCardProps> = ({
  icon,
  iconColor,
  iconBg,
  title,
  value,
  subtitle,
  accent = false,
}) => {
  const { colors } = useTheme();

  const activeIconColor = iconColor || colors.primary;
  const activeIconBg = iconBg || 'rgba(250, 204, 21, 0.12)';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: accent ? 'rgba(250, 204, 21, 0.32)' : colors.cardBorder,
          borderTopColor: accent ? 'rgba(250, 204, 21, 0.48)' : colors.cardBorderTop,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconWrapper, { backgroundColor: activeIconBg }]}>
          <Ionicons name={icon} size={18} color={activeIconColor} />
        </View>
        <Text style={[styles.title, { color: colors.textMuted }]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <Text
        style={[
          styles.value,
          { color: accent ? colors.primary : colors.text },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>

      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textDim }]} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  iconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '400',
  },
});
