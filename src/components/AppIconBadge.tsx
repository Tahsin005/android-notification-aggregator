import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { resolveAppIcon } from '../utils/appInfo';

interface AppIconBadgeProps {
  packageName: string;
  size?: number;
}

export const AppIconBadge: React.FC<AppIconBadgeProps> = ({ packageName, size = 38 }) => {
  const iconConfig = resolveAppIcon(packageName);
  const iconSize = Math.round(size * 0.52);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.28),
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          borderColor: 'rgba(255, 255, 255, 0.10)',
        },
      ]}
    >
      <View
        style={[
          styles.innerGlow,
          {
            backgroundColor: iconConfig.bgTint,
            borderRadius: Math.round(size * 0.24),
          },
        ]}
      >
        {iconConfig.iconType === 'material' ? (
          <MaterialCommunityIcons
            name={iconConfig.iconName as any}
            size={iconSize}
            color={iconConfig.brandColor}
          />
        ) : (
          <Ionicons
            name={iconConfig.iconName as any}
            size={iconSize}
            color={iconConfig.brandColor}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  innerGlow: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
