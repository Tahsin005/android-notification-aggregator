import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

export default function PrivacyScreen() {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy & Local Data</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
          <Ionicons name="shield-checkmark" size={36} color={colors.primary} />
          <Text style={[styles.heroTitle, { color: colors.primary }]}>100% On-Device & Private</Text>
          <Text style={[styles.heroSubtitle, { color: colors.text }]}>
            Notification Aggregator is engineered with privacy as a foundational principle. Your notifications contain personal and sensitive information that belongs only to you.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>CORE PRIVACY COMMITMENTS</Text>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.itemRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.surface }]}>
                <Ionicons name="server-outline" size={20} color={colors.success} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>No Remote Servers</Text>
                <Text style={[styles.itemDescription, { color: colors.textMuted }]}>
                  This app has no backend or cloud storage. Notification content is never transmitted over the internet or uploaded anywhere.
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.itemRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.surface }]}>
                <Ionicons name="analytics-outline" size={20} color={colors.success} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>Zero Analytics & Tracking</Text>
                <Text style={[styles.itemDescription, { color: colors.textMuted }]}>
                  We do not use tracking SDKs, telemetry, advertising identifiers, or analytics libraries.
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.itemRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.surface }]}>
                <Ionicons name="file-tray-full-outline" size={20} color={colors.success} />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>Local SQLite Database</Text>
                <Text style={[styles.itemDescription, { color: colors.textMuted }]}>
                  All captured titles, texts, and timestamps reside strictly in an encrypted/app-private SQLite database inside your phone’s internal storage.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>WHY NOTIFICATION ACCESS IS REQUIRED</Text>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, padding: 16 }]}>
            <Text style={[styles.paraText, { color: colors.text }]}>
              Android protects notifications behind a specialized permission named <Text style={{ fontWeight: '700' }}>Notification Access (NotificationListenerService)</Text>.
            </Text>
            <Text style={[styles.paraText, { color: colors.text, marginTop: 8 }]}>
              When enabled, Android allows our lightweight background service to read notifications when other applications post or dismiss them, and save them directly to your local database even when the app UI is closed.
            </Text>
            <Text style={[styles.paraText, { color: colors.text, marginTop: 8 }]}>
              You can revoke this permission at any moment through Android System Settings.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    gap: 20,
  },
  heroCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  paraText: {
    fontSize: 14,
    lineHeight: 21,
  },
});
