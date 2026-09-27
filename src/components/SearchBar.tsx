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
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={internalText}
        onChangeText={setInternalText}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {internalText.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton} accessibilityLabel="Clear search">
          <Ionicons name="close-circle" size={18} color={colors.textMuted} />
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
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
});
