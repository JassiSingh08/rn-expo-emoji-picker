import type { EmojiPickerTheme, EmojiPickerThemeOverride } from './types';

export const lightTheme: EmojiPickerTheme = {
  colors: {
    background: '#FFFFFF',
    text: '#1C1C1E',
    secondaryText: '#6D6D72',
    accent: '#007AFF',
    searchBackground: 'rgba(118,118,128,0.12)',
    searchText: '#1C1C1E',
    searchPlaceholder: '#8E8E93',
    divider: 'rgba(0,0,0,0.08)',
    categoryBarBackground: 'transparent',
    categoryActiveBackground: 'rgba(0,122,255,0.14)',
    overlayBackdrop: 'rgba(0,0,0,0.25)',
    overlaySurface: '#FFFFFF',
  },
  emojiSize: 28,
  cellPadding: 8,
  headerFontSize: 13,
  categoryBarIconSize: 20,
};

export const darkTheme: EmojiPickerTheme = {
  ...lightTheme,
  colors: {
    background: '#1C1C1E',
    text: '#FFFFFF',
    secondaryText: '#8E8E93',
    accent: '#0A84FF',
    searchBackground: 'rgba(118,118,128,0.24)',
    searchText: '#FFFFFF',
    searchPlaceholder: '#8E8E93',
    divider: 'rgba(255,255,255,0.10)',
    categoryBarBackground: 'transparent',
    categoryActiveBackground: 'rgba(10,132,255,0.24)',
    overlayBackdrop: 'rgba(0,0,0,0.5)',
    overlaySurface: '#2C2C2E',
  },
};

export function resolveTheme(
  base: EmojiPickerTheme,
  override?: EmojiPickerThemeOverride
): EmojiPickerTheme {
  if (!override) return base;
  return {
    ...base,
    ...override,
    colors: { ...base.colors, ...override.colors },
  };
}
