import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { displayEmoji, SKIN_TONES } from './skinTone';
import type { EmojiItem, EmojiPickerTheme, SkinTone } from './types';

const ARROW = 7;
const EDGE_MARGIN = 8;

interface VariantCellProps {
  item: EmojiItem;
  tone: SkinTone;
  fontSize: number;
  width: number;
  onSelect: (item: EmojiItem, tone: SkinTone) => void;
}

const VariantCell = memo(function VariantCell({
  item,
  tone,
  fontSize,
  width,
  onSelect,
}: VariantCellProps) {
  const handlePress = useCallback(() => onSelect(item, tone), [onSelect, item, tone]);
  return (
    <Pressable
      onPress={handlePress}
      style={[styles.variant, { width }]}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${tone.replace(/_/g, ' ')}`}
    >
      <Text style={{ fontSize }} allowFontScaling={false}>
        {displayEmoji(item, tone)}
      </Text>
    </Pressable>
  );
});

export interface VariantOverlayProps {
  item: EmojiItem;
  theme: EmojiPickerTheme;
  /** Pressed cell center / row top, in picker-container coordinates. */
  anchorX: number;
  anchorY: number;
  containerWidth: number;
  rowHeight: number;
  onSelect: (item: EmojiItem, tone: SkinTone) => void;
  onDismiss: () => void;
}

/**
 * Anchored tone popover: a bubble with the six variants attached directly
 * to the long-pressed cell (WhatsApp/Gboard style), clamped to the picker's
 * edges and flipped below the row when there is no room above. The backdrop
 * is transparent — no modal dimming.
 */
export const VariantOverlay = memo(function VariantOverlay({
  item,
  theme,
  anchorX,
  anchorY,
  containerWidth,
  rowHeight,
  onSelect,
  onDismiss,
}: VariantOverlayProps) {
  const fontSize = theme.emojiSize + 2;
  const cellWidth = fontSize + 14;
  const bubbleWidth = SKIN_TONES.length * cellWidth + 12;
  const bubbleHeight = fontSize + 20;

  const left = Math.max(
    EDGE_MARGIN,
    Math.min(anchorX - bubbleWidth / 2, containerWidth - bubbleWidth - EDGE_MARGIN)
  );
  const topAbove = anchorY - bubbleHeight - ARROW - 2;
  const flipBelow = topAbove < EDGE_MARGIN;
  const top = flipBelow ? anchorY + rowHeight + ARROW + 2 : topAbove;
  const arrowLeft = Math.max(
    left + 10,
    Math.min(anchorX - ARROW, left + bubbleWidth - 10 - ARROW * 2)
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="dismiss"
      />
      <View
        style={[
          styles.bubble,
          {
            left,
            top,
            width: bubbleWidth,
            height: bubbleHeight,
            borderRadius: bubbleHeight / 2,
            backgroundColor: theme.colors.overlaySurface,
          },
        ]}
      >
        {SKIN_TONES.map((tone) => (
          <VariantCell
            key={tone}
            item={item}
            tone={tone}
            fontSize={fontSize}
            width={cellWidth}
            onSelect={onSelect}
          />
        ))}
      </View>
      <View
        style={[
          styles.arrow,
          flipBelow
            ? { top: top - ARROW, borderBottomColor: theme.colors.overlaySurface }
            : { top: top + bubbleHeight, borderTopColor: theme.colors.overlaySurface },
          { left: arrowLeft },
          flipBelow ? styles.arrowUp : styles.arrowDown,
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 8,
  },
  variant: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: ARROW,
    borderRightWidth: ARROW,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    // Android draws shadows per-view; the arrow must not cast its own.
    elevation: 8,
  },
  arrowDown: {
    borderTopWidth: ARROW,
  },
  arrowUp: {
    borderBottomWidth: ARROW,
  },
});
