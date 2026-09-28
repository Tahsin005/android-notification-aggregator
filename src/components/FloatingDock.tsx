import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface FloatingDockProps {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  navigation: {
    emit: (event: any) => any;
    navigate: (name: string) => void;
  };
  descriptors?: any;
  insets?: any;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  // Elevate comfortably above the Android gesture navigation bar / home pill
  const bottomOffset = Math.max(insets.bottom, 14) + 10;

  const tabIcons: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap; label: string }> = {
    index: {
      active: 'file-tray-full',
      inactive: 'file-tray-full-outline',
      label: 'Archive',
    },
    apps: {
      active: 'grid',
      inactive: 'grid-outline',
      label: 'Apps',
    },
    settings: {
      active: 'settings',
      inactive: 'settings-outline',
      label: 'Settings',
    },
  };

  return (
    <View style={[styles.dockContainer, { bottom: bottomOffset }]} pointerEvents="box-none">
      <View
        style={[
          styles.dockCapsule,
          {
            backgroundColor: 'rgba(20, 23, 31, 0.94)',
            borderColor: 'rgba(255, 255, 255, 0.10)',
            borderTopColor: 'rgba(255, 255, 255, 0.22)',
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const config = tabIcons[route.name] || {
            active: 'square',
            inactive: 'square-outline',
            label: route.name,
          };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.8}
              style={[
                styles.tabItem,
                isFocused && [
                  styles.activeTabItem,
                  {
                    backgroundColor: colors.dockActiveBg,
                    borderColor: colors.dockActiveBorder,
                  },
                ],
              ]}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={config.label}
            >
              <Ionicons
                name={isFocused ? config.active : config.inactive}
                size={23}
                color={isFocused ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)'}
              />
              {isFocused && (
                <View
                  style={[
                    styles.activeDot,
                    { backgroundColor: colors.primary },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dockContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  dockCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 36,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 16,
  },
  tabItem: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeTabItem: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  activeDot: {
    position: 'absolute',
    bottom: 5,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
