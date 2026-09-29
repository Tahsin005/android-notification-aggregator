import React from 'react';
import { Tabs } from 'expo-router';
import { FloatingDock } from '../../components/FloatingDock';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingDock {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Archive',
        }}
      />
      <Tabs.Screen
        name="apps"
        options={{
          title: 'Apps',
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}
