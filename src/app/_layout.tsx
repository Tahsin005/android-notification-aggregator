import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { applyRetentionPolicy } from '../services/retentionService';

export default function RootLayout() {
  useEffect(() => {
    async function initApp() {
      try {
        await applyRetentionPolicy();
      } catch (e) {
        console.warn('Initialization error:', e);
      }
    }
    initApp();
  }, []);

  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
  );
}
