import { useCallback, useRef } from 'react';
import { I18nManager } from 'react-native';
import type { GestureResponderEvent, LayoutChangeEvent } from 'react-native';
import type { EmojiCategoryKey, EmojiItem, VariantAnchor } from './types';

/**
 * Row-level touch resolution: one Pressable per row, tapped column derived
 * from the touch x-position. Shared by the JS and native row renderers.
 * Long-presses also report an anchor (cell center, row top) in page
 * coordinates so the tone popover can attach to the pressed cell.
 */
export function useRowTouch(
  emojis: EmojiItem[],
  category: EmojiCategoryKey,
  numColumns: number,
  onPress: (item: EmojiItem, category: EmojiCategoryKey) => void,
  onLongPress: (
    item: EmojiItem,
    category: EmojiCategoryKey,
    anchor: VariantAnchor
  ) => void
) {
  // Width lives in a ref: layout must never re-render a recycled row.
  const widthRef = useRef(0);
  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    widthRef.current = e.nativeEvent.layout.width;
  }, []);

  const columnAt = useCallback(
    (e: GestureResponderEvent): { item: EmojiItem; visualCol: number } | null => {
      const width = widthRef.current;
      if (width <= 0) return null;
      let visualCol = Math.floor((e.nativeEvent.locationX / width) * numColumns);
      visualCol = Math.max(0, Math.min(numColumns - 1, visualCol));
      const col = I18nManager.isRTL ? numColumns - 1 - visualCol : visualCol;
      const item = emojis[col];
      return item ? { item, visualCol } : null;
    },
    [emojis, numColumns]
  );

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      const hit = columnAt(e);
      if (hit) onPress(hit.item, category);
    },
    [columnAt, onPress, category]
  );

  const handleLongPress = useCallback(
    (e: GestureResponderEvent) => {
      const hit = columnAt(e);
      if (!hit?.item.toneTemplate) return;
      const { locationX, locationY, pageX, pageY } = e.nativeEvent;
      const colWidth = widthRef.current / numColumns;
      onLongPress(hit.item, category, {
        x: pageX - locationX + (hit.visualCol + 0.5) * colWidth,
        y: pageY - locationY,
      });
    },
    [columnAt, onLongPress, category, numColumns]
  );

  return { handleLayout, handlePress, handleLongPress };
}
