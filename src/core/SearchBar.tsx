import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { EmojiPickerStrings, EmojiPickerTheme } from './types';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  theme: EmojiPickerTheme;
  strings: EmojiPickerStrings;
}

export const SearchBar = memo(function SearchBar({
  value,
  onChangeText,
  theme,
  strings,
}: SearchBarProps) {
  return (
    <View
      style={[styles.wrap, { backgroundColor: theme.colors.searchBackground }]}
    >
      <TextInput
        style={[styles.input, { color: theme.colors.searchText }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={strings.searchPlaceholder}
        placeholderTextColor={theme.colors.searchPlaceholder}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        accessibilityLabel={strings.searchPlaceholder}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          style={styles.clear}
          accessibilityRole="button"
          accessibilityLabel={strings.clearSearch}
          hitSlop={8}
        >
          <Text style={[styles.clearText, { color: theme.colors.secondaryText }]}>
            ✕
          </Text>
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
  },
  clear: {
    marginLeft: 6,
  },
  clearText: {
    fontSize: 14,
  },
});
