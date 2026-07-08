import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { applyToneToTemplate, SKIN_TONES } from './skinTone';
import type { EmojiPickerTheme, SkinTone } from './types';

const HAND_TEMPLATE = '✋{t}';

interface SwatchProps {
  tone: SkinTone;
  selected: boolean;
  size: number;
  accent: string;
  onSelect: (tone: SkinTone) => void;
}

const Swatch = memo(function Swatch({ tone, selected, size, accent, onSelect }: SwatchProps) {
  const handlePress = useCallback(() => onSelect(tone), [onSelect, tone]);
  return (
    <Pressable
      onPress={handlePress}
      style={[styles.swatch, selected && { borderColor: accent }]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`skin tone: ${tone.replace(/_/g, ' ')}`}
    >
      <Text style={{ fontSize: size }} allowFontScaling={false}>
        {applyToneToTemplate(HAND_TEMPLATE, tone)}
      </Text>
    </Pressable>
  );
});

export interface SkinToneSelectorProps {
  selectedTone: SkinTone;
  theme: EmojiPickerTheme;
  onSelect: (tone: SkinTone) => void;
}

/** The global skin tone picker row, shown when the hand button is toggled. */
export const SkinToneSelector = memo(function SkinToneSelector({
  selectedTone,
  theme,
  onSelect,
}: SkinToneSelectorProps) {
  return (
    <View style={[styles.row, { borderBottomColor: theme.colors.divider }]}>
      {SKIN_TONES.map((tone) => (
        <Swatch
          key={tone}
          tone={tone}
          selected={tone === selectedTone}
          size={theme.categoryBarIconSize + 4}
          accent={theme.colors.accent}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  swatch: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
});
