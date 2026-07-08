import React, { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import {
  requireNativeViewManager,
  requireOptionalNativeModule,
} from 'expo-modules-core';
import { EmojiRow } from './EmojiRow';
import { useRowTouch } from './rowTouch';
import { displayEmoji } from './skinTone';
import type { ComponentType } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { EmojiRowProps } from './EmojiRow';

interface NativeRowViewProps {
  glyphs: string[];
  fontSize: number;
  columns: number;
  style?: StyleProp<ViewStyle>;
}

// Resolved once at module load. In Expo Go (or any app where the native
// module isn't linked) this stays null and rows fall back to the JS
// renderer — same picker, best available rendering.
let NativeRowView: ComponentType<NativeRowViewProps> | null = null;
try {
  if (requireOptionalNativeModule('RNSEmogiRow') != null) {
    NativeRowView = requireNativeViewManager<NativeRowViewProps>('RNSEmogiRow');
  }
} catch {
  NativeRowView = null;
}

if (NativeRowView == null && __DEV__) {
  // Loud in dev so a missing module is never mistaken for the fast path —
  // expected in Expo Go, a rebuild reminder everywhere else.
  console.warn(
    '[rn-s-emogi-picker] Native row module not linked — using JS rows. ' +
      'Expected in Expo Go; in a dev build, rebuild the native app ' +
      '(expo run:ios / run:android) after installing.'
  );
}

/** True when the RNSEmogiRow native view is linked into this build. */
export const isNativeEmojiRowAvailable = NativeRowView != null;

/**
 * Native-backed row: the whole row of glyphs is ONE native view (CoreText /
 * canvas drawing) instead of one Text per emoji. Touch handling stays in JS
 * via the same row-level hit test as the JS renderer.
 */
export const NativeEmojiRow = memo(function NativeEmojiRow(props: EmojiRowProps) {
  const {
    emojis,
    category,
    numColumns,
    rowHeight,
    emojiSize,
    skinTone,
    onPress,
    onLongPress,
  } = props;
  const { handleLayout, handlePress, handleLongPress } = useRowTouch(
    emojis,
    category,
    numColumns,
    onPress,
    onLongPress
  );

  if (!NativeRowView) {
    return <EmojiRow {...props} />;
  }

  return (
    <Pressable
      style={{ height: rowHeight }}
      onLayout={handleLayout}
      onPress={handlePress}
      onLongPress={handleLongPress}
      accessibilityRole="menubar"
      accessibilityLabel={emojis.map((e) => e.name).join(', ')}
    >
      <NativeRowView
        glyphs={emojis.map((item) => displayEmoji(item, skinTone))}
        fontSize={emojiSize}
        columns={numColumns}
        style={styles.fill}
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
