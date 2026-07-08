import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRowTouch } from './rowTouch';
import { displayEmoji } from './skinTone';
import type { EmojiCategoryKey, EmojiItem, SkinTone, VariantAnchor } from './types';

export interface EmojiRowProps {
  emojis: EmojiItem[];
  category: EmojiCategoryKey;
  numColumns: number;
  rowHeight: number;
  emojiSize: number;
  skinTone: SkinTone;
  onPress: (item: EmojiItem, category: EmojiCategoryKey) => void;
  onLongPress: (
    item: EmojiItem,
    category: EmojiCategoryKey,
    anchor: VariantAnchor
  ) => void;
}

/**
 * One Pressable per ROW, cells as plain Text — instead of a Pressable per
 * cell. The tapped column is resolved from the touch x-position. This keeps
 * a row at ~2 components instead of 9, which is what makes recycling
 * re-binds (fast flings, category jumps) cheap on low-end devices.
 *
 * Stateless and fully prop-driven — required for recycling correctness.
 */
export const EmojiRow = memo(function EmojiRow({
  emojis,
  category,
  numColumns,
  rowHeight,
  emojiSize,
  skinTone,
  onPress,
  onLongPress,
}: EmojiRowProps) {
  const { handleLayout, handlePress, handleLongPress } = useRowTouch(
    emojis,
    category,
    numColumns,
    onPress,
    onLongPress
  );

  return (
    <Pressable
      style={[styles.row, { height: rowHeight }]}
      onLayout={handleLayout}
      onPress={handlePress}
      onLongPress={handleLongPress}
      accessibilityRole="menubar"
      accessibilityLabel={emojis.map((e) => e.name).join(', ')}
    >
      {emojis.map((item) => (
        <Text
          key={item.slug}
          // Text must not become the touch target: locationX is relative to
          // the view that was hit, and column math needs row coordinates.
          style={[styles.cell, { fontSize: emojiSize }]}
          allowFontScaling={false}
        >
          {displayEmoji(item, skinTone)}
        </Text>
      ))}
      {emojis.length < numColumns && (
        <View style={{ flex: numColumns - emojis.length }} />
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    pointerEvents: 'none',
  },
});
