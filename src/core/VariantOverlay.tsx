import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { displayEmoji, SKIN_TONES } from './skinTone';
import type { EmojiItem, EmojiPickerTheme, SkinTone } from './types';

interface VariantCellProps {
  item: EmojiItem;
  tone: SkinTone;
  emojiSize: number;
  onSelect: (item: EmojiItem, tone: SkinTone) => void;
}

const VariantCell = memo(function VariantCell({
  item,
  tone,
  emojiSize,
  onSelect,
}: VariantCellProps) {
  const handlePress = useCallback(() => onSelect(item, tone), [onSelect, item, tone]);
  return (
    <Pressable
      onPress={handlePress}
      style={styles.variant}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${tone.replace(/_/g, ' ')}`}
    >
      <Text style={{ fontSize: emojiSize }} allowFontScaling={false}>
        {displayEmoji(item, tone)}
      </Text>
    </Pressable>
  );
});

export interface VariantOverlayProps {
  item: EmojiItem;
  theme: EmojiPickerTheme;
  onSelect: (item: EmojiItem, tone: SkinTone) => void;
  onDismiss: () => void;
}

/** Per-emoji skin tone variants, opened by long-pressing a cell. */
export const VariantOverlay = memo(function VariantOverlay({
  item,
  theme,
  onSelect,
  onDismiss,
}: VariantOverlayProps) {
  return (
    <Pressable
      style={[styles.backdrop, { backgroundColor: theme.colors.overlayBackdrop }]}
      onPress={onDismiss}
      accessibilityRole="button"
      accessibilityLabel="dismiss"
    >
      <View
        style={[styles.card, { backgroundColor: theme.colors.overlaySurface }]}
        // Keep taps on the card from falling through to the backdrop.
        onStartShouldSetResponder={() => true}
      >
        <Text
          style={[styles.name, { color: theme.colors.secondaryText }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View style={styles.variants}>
          {SKIN_TONES.map((tone) => (
            <VariantCell
              key={tone}
              item={item}
              tone={tone}
              emojiSize={theme.emojiSize + 4}
              onSelect={onSelect}
            />
          ))}
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  card: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    textAlign: 'center',
    marginBottom: 6,
  },
  variants: {
    flexDirection: 'row',
  },
  variant: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
