import React, { memo, useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { getEmojiByGlyph } from './data';
import { toUnicodeString } from './skinTone';
import { darkTheme, lightTheme, resolveTheme } from './theme';
import type { StyleProp, ViewStyle } from 'react-native';
import type { EmojiPickerThemeOverride, EmojiSelection } from './types';

const DEFAULT_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

interface ReactionCellProps {
  glyph: string;
  selected: boolean;
  size: number;
  selectedBackground: string;
  onPress: (glyph: string) => void;
}

const ReactionCell = memo(function ReactionCell({
  glyph,
  selected,
  size,
  selectedBackground,
  onPress,
}: ReactionCellProps) {
  const handlePress = useCallback(() => onPress(glyph), [onPress, glyph]);
  const item = getEmojiByGlyph(glyph);
  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.cell,
        { width: size + 14, height: size + 14, borderRadius: (size + 14) / 2 },
        selected && { backgroundColor: selectedBackground },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={item?.name ?? glyph}
    >
      <Text style={{ fontSize: size }} allowFontScaling={false}>
        {glyph}
      </Text>
    </Pressable>
  );
});

export interface EmojiReactionBarProps {
  /** Fired with the full selection payload when a reaction is tapped. */
  onEmojiSelected: (selection: EmojiSelection) => void;
  /** Quick reactions to offer. Default: 👍 ❤️ 😂 😮 😢 🙏 */
  emojis?: string[];
  /** Glyphs to render highlighted (reactions the user already gave). */
  selectedEmojis?: string[];
  /** When provided, renders a ＋ button that calls this — open your full picker. */
  onOpenPicker?: () => void;
  colorScheme?: 'light' | 'dark' | 'auto';
  theme?: EmojiPickerThemeOverride;
  /** Glyph font size. Default 26. */
  emojiSize?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * WhatsApp/Slack-style quick reaction bar — the companion to the full
 * picker. Anchor it over a long-pressed message yourself (it's a plain
 * view), wire ＋ to open the EmojiPicker for the full grid.
 */
export const EmojiReactionBar = memo(function EmojiReactionBar({
  onEmojiSelected,
  emojis = DEFAULT_REACTIONS,
  selectedEmojis,
  onOpenPicker,
  colorScheme = 'auto',
  theme: themeOverride,
  emojiSize = 26,
  style,
}: EmojiReactionBarProps) {
  const systemScheme = useColorScheme();
  const scheme = colorScheme === 'auto' ? (systemScheme ?? 'light') : colorScheme;
  const theme = useMemo(
    () => resolveTheme(scheme === 'dark' ? darkTheme : lightTheme, themeOverride),
    [scheme, themeOverride]
  );
  const selectedSet = useMemo(() => new Set(selectedEmojis), [selectedEmojis]);

  const handlePress = useCallback(
    (glyph: string) => {
      const item = getEmojiByGlyph(glyph);
      onEmojiSelected({
        emoji: glyph,
        unicode: toUnicodeString(glyph),
        name: item?.name ?? '',
        category: item?.category ?? 'smileys_emotion',
        skinTone: 'default',
        baseEmoji: item?.emoji ?? glyph,
      });
    },
    [onEmojiSelected]
  );

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: theme.colors.overlaySurface },
        style,
      ]}
    >
      {emojis.map((glyph) => (
        <ReactionCell
          key={glyph}
          glyph={glyph}
          selected={selectedSet.has(glyph)}
          size={emojiSize}
          selectedBackground={theme.colors.categoryActiveBackground}
          onPress={handlePress}
        />
      ))}
      {onOpenPicker && (
        <Pressable
          onPress={onOpenPicker}
          style={[
            styles.cell,
            styles.plus,
            {
              width: emojiSize + 14,
              height: emojiSize + 14,
              borderRadius: (emojiSize + 14) / 2,
              backgroundColor: theme.colors.searchBackground,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="more emoji"
        >
          <Text
            style={[styles.plusText, { fontSize: emojiSize - 6, color: theme.colors.secondaryText }]}
            allowFontScaling={false}
          >
            ＋
          </Text>
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRadius: 999,
    gap: 2,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 8,
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    marginLeft: 2,
  },
  plusText: {
    fontWeight: '600',
  },
});
