import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { getDatabase } from '../database/db';
import { applyRetentionPolicy } from '../services/retentionService';

export default function RootLayout() {
  useEffect(() => {
    async function initApp() {
      try {
        await getDatabase();
        await applyRetentionPolicy();
      } catch (e) {
        console.warn('Initialization error:', e);
      }
    }
    initApp();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="privacy"
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
