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
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: colors.warningLight }]}>
          <Ionicons name="lock-open-outline" size={20} color={colors.warning} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Archive your notifications</Text>
      </View>

      <Text style={[styles.body, { color: colors.textMuted }]}>
        Notification Aggregator captures and stores notifications from your Android apps locally so you can easily browse, search, and manage them anytime.
      </Text>

      <View style={styles.privacyNote}>
        <Ionicons name="shield-checkmark-outline" size={14} color={colors.success} />
        <Text style={[styles.privacyText, { color: colors.success }]}>
          Your notification data strictly stays private on this device.
        </Text>
      </View>

      <Text style={[styles.syncNote, { color: colors.textMuted }]}>
        Note: Android only makes notifications available from the moment Notification Access is enabled. Active notifications will be imported automatically.
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={onEnablePress}
        activeOpacity={0.8}
      >
        <Ionicons name="settings-outline" size={16} color="#FFFFFF" />
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
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
  syncNote: {
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 10,
    gap: 8,
    marginTop: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
