import type { ComponentType, ForwardRefExoticComponent, ReactElement, RefAttributes } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { EmojiCategoryKey, EmojiItem } from './types';

/**
 * Every list entry is either a category header or a full ROW of emoji.
 * Rows (not individual cells) are the list items, so both engines see a
 * single uniform item shape and never need numColumns.
 */
export type PickerListItem =
  | { type: 'header'; key: string; category: EmojiCategoryKey; title: string }
  | { type: 'row'; key: string; category: EmojiCategoryKey; emojis: EmojiItem[] };

export interface EmojiListViewToken {
  item: PickerListItem | null | undefined;
  index: number | null | undefined;
  isViewable: boolean;
}

/**
 * The engine-agnostic adapter contract. FlashList, LegendList and FlatList
 * adapters all implement exactly this surface; core never imports a list
 * library.
 */
export interface EmojiListEngineProps {
  data: PickerListItem[];
  renderItem: (info: { item: PickerListItem; index: number }) => ReactElement | null;
  keyExtractor: (item: PickerListItem, index: number) => string;
  stickyHeaderIndices: number[];
  /** Exact height of a 'row' item — LegendList's estimatedItemSize, FlatList's getItemLayout. */
  rowHeight: number;
  /** Exact height of a 'header' item. */
  headerHeight: number;
  onViewableItemsChanged: (info: { viewableItems: EmojiListViewToken[] }) => void;
  ScrollComponent?: ComponentType<any>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  showsVerticalScrollIndicator?: boolean;
  /** Change signal for engines whose recycled items must re-render (skin tone, theme). */
  extraData?: unknown;
}

export interface EmojiListHandle {
  scrollToIndex(params: { index: number; animated?: boolean; viewOffset?: number }): void;
}

export type EmojiListEngine = ForwardRefExoticComponent<
  EmojiListEngineProps & RefAttributes<EmojiListHandle>
>;

/** Shared viewability config — must be a stable reference for all engines. */
export const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 50,
  minimumViewTime: 32,
} as const;
