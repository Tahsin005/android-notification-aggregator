import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface PermissionBannerProps {
  onEnablePress: () => void;
}

export const PermissionBanner: React.FC<PermissionBannerProps> = ({ onEnablePress }) => {
  const { colors } = useTheme();

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
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: 'rgba(251, 191, 36, 0.12)', borderColor: 'rgba(251, 191, 36, 0.28)' }]}>
          <Ionicons name="lock-open-outline" size={18} color={colors.warning} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Capture & Archive Notifications</Text>
      </View>

      <Text style={[styles.body, { color: colors.textMuted }]}>
        Notification Aggregator captures incoming notifications from your apps locally so you can browse, filter, search, and manage them anytime.
      </Text>

      <View style={styles.privacyNote}>
        <Ionicons name="shield-checkmark" size={14} color={colors.success} />
        <Text style={[styles.privacyText, { color: colors.success }]}>
          100% on-device. Your notifications never leave your phone.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={onEnablePress}
        activeOpacity={0.8}
      >
        <Ionicons name="settings-outline" size={16} color="#070A10" />
        <Text style={styles.buttonText}>Enable Notification Access</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  privacyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    gap: 8,
    marginTop: 4,
  },
  buttonText: {
    color: '#070A10',
    fontSize: 14,
    fontWeight: '700',
  },
});
