import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search notifications...',
  debounceMs = 300,
}) => {
  const { colors } = useTheme();
  const [internalText, setInternalText] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setInternalText(value);
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      onChangeText(internalText);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [internalText, debounceMs, onChangeText]);

  const handleClear = () => {
    setInternalText('');
    onChangeText('');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          borderTopColor: 'rgba(255, 255, 255, 0.14)',
        },
      ]}
    >
      <Ionicons name="search" size={17} color={colors.textMuted} style={styles.searchIcon} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textDim}
        value={internalText}
        onChangeText={setInternalText}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {internalText.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton} accessibilityLabel="Clear search">
          <Ionicons name="close-circle" size={17} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 13,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  searchIcon: {
    marginRight: 9,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
});
