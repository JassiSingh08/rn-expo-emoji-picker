import { useCallback, useRef } from 'react';
import { I18nManager } from 'react-native';
import type { GestureResponderEvent, LayoutChangeEvent } from 'react-native';
import type { EmojiCategoryKey, EmojiItem } from './types';

/**
 * Row-level touch resolution: one Pressable per row, tapped column derived
 * from the touch x-position. Shared by the JS and native row renderers.
 */
export function useRowTouch(
  emojis: EmojiItem[],
  category: EmojiCategoryKey,
  numColumns: number,
  onPress: (item: EmojiItem, category: EmojiCategoryKey) => void,
  onLongPress: (item: EmojiItem, category: EmojiCategoryKey) => void
) {
  // Width lives in a ref: layout must never re-render a recycled row.
  const widthRef = useRef(0);
  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    widthRef.current = e.nativeEvent.layout.width;
  }, []);

  const itemAt = useCallback(
    (e: GestureResponderEvent): EmojiItem | null => {
      const width = widthRef.current;
      if (width <= 0) return null;
      let col = Math.floor((e.nativeEvent.locationX / width) * numColumns);
      col = Math.max(0, Math.min(numColumns - 1, col));
      if (I18nManager.isRTL) col = numColumns - 1 - col;
      return emojis[col] ?? null;
    },
    [emojis, numColumns]
  );

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      const item = itemAt(e);
      if (item) onPress(item, category);
    },
    [itemAt, onPress, category]
  );

  const handleLongPress = useCallback(
    (e: GestureResponderEvent) => {
      const item = itemAt(e);
      if (item?.toneTemplate) onLongPress(item, category);
    },
    [itemAt, onLongPress, category]
  );

  return { handleLayout, handlePress, handleLongPress };
}
