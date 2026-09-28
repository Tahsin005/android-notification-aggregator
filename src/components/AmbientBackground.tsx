import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const AmbientBackground: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">

      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />


      <View
        style={[
          styles.blob,
          {
            top: -SCREEN_WIDTH * 0.35,
            right: -SCREEN_WIDTH * 0.25,
            width: SCREEN_WIDTH * 1.3,
            height: SCREEN_WIDTH * 1.3,
            borderRadius: SCREEN_WIDTH * 0.65,
            backgroundColor: '#FACC15',
            opacity: 0.16,
          },
        ]}
      />


      <View
        style={[
          styles.blob,
          {
            top: SCREEN_WIDTH * 0.8,
            left: -SCREEN_WIDTH * 0.4,
            width: SCREEN_WIDTH * 0.9,
            height: SCREEN_WIDTH * 0.9,
            borderRadius: SCREEN_WIDTH * 0.45,
            backgroundColor: '#FB923C',
            opacity: 0.08,
          },
        ]}
      />


      <View
        style={[
          styles.blob,
          {
            bottom: -SCREEN_WIDTH * 0.3,
            right: -SCREEN_WIDTH * 0.2,
            width: SCREEN_WIDTH * 0.8,
            height: SCREEN_WIDTH * 0.8,
            borderRadius: SCREEN_WIDTH * 0.4,
            backgroundColor: '#F59E0B',
            opacity: 0.06,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
  },
});
