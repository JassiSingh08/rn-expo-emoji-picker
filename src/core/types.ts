import type { ComponentType, ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

/** Category keys as stored in the generated dataset. */
export type EmojiDataCategoryKey =
  | 'smileys_emotion'
  | 'people_body'
  | 'animals_nature'
  | 'food_drink'
  | 'travel_places'
  | 'activities'
  | 'objects'
  | 'symbols'
  | 'flags';

/** Data categories plus the virtual "recently used" section. */
export type EmojiCategoryKey = EmojiDataCategoryKey | 'recently_used';

/**
 * Compact build-time tuple: [emoji, name, emojiVersion, keywordsCsv, toneTemplate?].
 * toneTemplate contains "{t}" wherever a skin tone modifier belongs.
 */
export type RawEmojiTuple =
  | [string, string, number, string]
  | [string, string, number, string, string];

export interface EmojiDataFile {
  groups: Array<{ key: EmojiDataCategoryKey; emojis: RawEmojiTuple[] }>;
}

/** A single emoji, decoded once at module load. */
export interface EmojiItem {
  emoji: string;
  name: string;
  slug: string;
  category: EmojiDataCategoryKey;
  version: number;
  keywords: string;
  toneTemplate: string | null;
}

/** Long-press anchor in screen (page) coordinates: cell center X, row top Y. */
export interface VariantAnchor {
  x: number;
  y: number;
}

export type SkinTone =
  | 'default'
  | 'light'
  | 'medium_light'
  | 'medium'
  | 'medium_dark'
  | 'dark';

/** Payload passed to `onEmojiSelected`. */
export interface EmojiSelection {
  /** The glyph to insert, with the skin tone already applied. */
  emoji: string;
  /** Hyphen-joined uppercase code points, e.g. "1F44B-1F3FD". */
  unicode: string;
  name: string;
  /** Section the user picked from — may be 'recently_used'. */
  category: EmojiCategoryKey;
  skinTone: SkinTone;
  /** The untoned base glyph. */
  baseEmoji: string;
}

/**
 * Minimal async key-value contract. `@react-native-async-storage/async-storage`
 * satisfies it directly, as does `expo-sqlite/kv-store`.
 */
export interface EmojiPickerStorage {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
}

export interface EmojiPickerStrings {
  searchPlaceholder: string;
  noResults: string;
  clearSearch: string;
  skinToneSelector: string;
  categories: Record<EmojiCategoryKey, string>;
}

export interface EmojiPickerStringsOverride
  extends Partial<Omit<EmojiPickerStrings, 'categories'>> {
  categories?: Partial<Record<EmojiCategoryKey, string>>;
}

export interface EmojiPickerTheme {
  colors: {
    background: string;
    text: string;
    secondaryText: string;
    accent: string;
    searchBackground: string;
    searchText: string;
    searchPlaceholder: string;
    divider: string;
    categoryBarBackground: string;
    categoryActiveBackground: string;
    overlayBackdrop: string;
    overlaySurface: string;
  };
  /** Font size of the emoji glyph. Row height = emojiSize + 2 * cellPadding. */
  emojiSize: number;
  cellPadding: number;
  headerFontSize: number;
  categoryBarIconSize: number;
}

export interface EmojiPickerThemeOverride
  extends Partial<Omit<EmojiPickerTheme, 'colors'>> {
  colors?: Partial<EmojiPickerTheme['colors']>;
}

export interface EmojiPickerProps {
  onEmojiSelected: (selection: EmojiSelection) => void;
  /** Emoji per row. Default 8. */
  numColumns?: number;
  /** Subset and order of categories to show. Default: all, dataset order. */
  categories?: EmojiDataCategoryKey[];
  /**
   * Hide emoji introduced after this Unicode Emoji version so unsupported
   * glyphs never render as tofu boxes. Default 'auto': detect what the
   * device supports from its OS version (Android 12+ and iOS 26.4+ show
   * everything, older OSes get capped). Pass a number (e.g. 12) to pin a
   * version, or null to always show everything.
   */
  maxEmojiVersion?: number | null | 'auto';
  /** 'auto' follows the system appearance. Default 'auto'. */
  colorScheme?: 'light' | 'dark' | 'auto';
  /** Partial overrides merged over the light/dark base theme. */
  theme?: EmojiPickerThemeOverride;
  /** Localized strings. English defaults. */
  strings?: EmojiPickerStringsOverride;
  enableSearch?: boolean;
  searchDebounceMs?: number;
  enableRecentlyUsed?: boolean;
  /** Max emoji shown in the recently-used section. Default 16. */
  recentlyUsedLimit?: number;
  /** Persistence for recents. Default: shared in-memory (resets on app restart). */
  storage?: EmojiPickerStorage;
  /** Storage key for recents. Default 'rn-expo-emoji-picker:recents'. */
  storageKey?: string;
  /** Show the global skin tone button next to the search bar. Default true. */
  enableSkinToneSelector?: boolean;
  /** Controlled skin tone. Use with onSkinToneChange. */
  skinTone?: SkinTone;
  /** Initial skin tone when uncontrolled. Default 'default'. */
  defaultSkinTone?: SkinTone;
  onSkinToneChange?: (tone: SkinTone) => void;
  /**
   * Custom scroll component injected into the list engine — pass
   * BottomSheetScrollView from @gorhom/bottom-sheet to fix scroll
   * conflicts inside a bottom sheet.
   */
  ScrollComponent?: ComponentType<any>;
  /** Fired when the active category changes while scrolling. */
  onCategoryChanged?: (category: EmojiCategoryKey) => void;
  /**
   * Extra element rendered at the end of the header row, after the search
   * bar and skin tone button — e.g. a backspace key for chat inputs.
   */
  headerRight?: ReactNode;
  /**
   * Where the category tab bar sits. Default 'top'; 'bottom' matches system
   * keyboards; 'hidden' removes it (recently used still appears as the top
   * section of the list, and the list keeps its scroll position when that
   * section grows).
   */
  categoryBarPosition?: 'top' | 'bottom' | 'hidden';
  /** Glyphs to hide entirely, matched against the base (untoned) emoji. */
  excludeEmojis?: string[];
  style?: StyleProp<ViewStyle>;
  /** contentContainerStyle forwarded to the list. */
  contentContainerStyle?: StyleProp<ViewStyle>;
}
