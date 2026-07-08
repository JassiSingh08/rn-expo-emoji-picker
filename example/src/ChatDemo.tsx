import React, { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';
// The /native entry gives the sheet's picker native rows in dev builds and
// falls back to JS rows in Expo Go — always safe to import in an Expo app.
import { EmojiPicker, EmojiReactionBar } from 'rn-s-emogi-picker/native';
import type { EmojiSelection } from 'rn-s-emogi-picker/native';
import { CustomSheet } from './CustomSheet';

interface Message {
  id: string;
  text: string;
  mine: boolean;
}

const MESSAGES: Message[] = [
  { id: 'm1', text: 'Yo! The picker demo looks 🔥', mine: false },
  {
    id: 'm2',
    text: 'Native rows just landed — zero blank cells on my 4-year-old Android',
    mine: true,
  },
  { id: 'm3', text: 'Long-press this message to react 👀', mine: false },
  { id: 'm4', text: 'And ＋ opens the full picker in a sheet', mine: true },
];

const BAR_HEIGHT = 46;

export function ChatDemo() {
  const [reactions, setReactions] = useState<Record<string, string[]>>({});
  const [barFor, setBarFor] = useState<Message | null>(null);
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const rowTops = useRef<Record<string, number>>({});

  const toggleReaction = useCallback((id: string, emoji: string) => {
    setReactions((prev) => {
      const current = prev[id] ?? [];
      return {
        ...prev,
        [id]: current.includes(emoji)
          ? current.filter((e) => e !== emoji)
          : [...current, emoji],
      };
    });
    setBarFor(null);
  }, []);

  const handleBarSelect = useCallback(
    (e: EmojiSelection) => {
      if (barFor) toggleReaction(barFor.id, e.emoji);
    },
    [barFor, toggleReaction]
  );

  const handleOpenPicker = useCallback(() => {
    if (barFor) setPickerFor(barFor.id);
    setBarFor(null);
  }, [barFor]);

  const handlePickerSelect = useCallback(
    (e: EmojiSelection) => {
      if (pickerFor) toggleReaction(pickerFor, e.emoji);
      setPickerFor(null);
    },
    [pickerFor, toggleReaction]
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.messages}>
        {MESSAGES.map((m) => (
          <View
            key={m.id}
            onLayout={(e) => {
              rowTops.current[m.id] = e.nativeEvent.layout.y;
            }}
            style={[styles.row, m.mine ? styles.rowMine : styles.rowTheirs]}
          >
            <Pressable
              onLongPress={() => setBarFor(m)}
              style={[styles.bubble, m.mine ? styles.bubbleMine : styles.bubbleTheirs]}
            >
              <Text style={[styles.text, m.mine && styles.textMine]}>{m.text}</Text>
            </Pressable>
            {(reactions[m.id]?.length ?? 0) > 0 && (
              <View style={styles.chips}>
                {reactions[m.id]!.map((emoji) => (
                  <Pressable
                    key={emoji}
                    onPress={() => toggleReaction(m.id, emoji)}
                    style={styles.chip}
                  >
                    <Text style={styles.chipText}>{emoji}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {barFor && (
        <>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setBarFor(null)} />
          {/* The bar ships without animation on purpose — the app wraps it
              in its own animation system. Entering AND exiting both work
              because this wrapper owns mount/unmount. */}
          <Animated.View
            entering={FadeInUp.springify()}
            exiting={FadeOut}
            style={[
              styles.bar,
              // rowTops are relative to the content; add the top padding.
              // The demo list doesn't scroll, so no scroll offset needed.
              { top: 32 + (rowTops.current[barFor.id] ?? 0) - BAR_HEIGHT - 6 },
              barFor.mine ? styles.barMine : styles.barTheirs,
            ]}
          >
            <EmojiReactionBar
              onEmojiSelected={handleBarSelect}
              selectedEmojis={reactions[barFor.id]}
              onOpenPicker={handleOpenPicker}
            />
          </Animated.View>
        </>
      )}

      <CustomSheet visible={pickerFor != null} onClose={() => setPickerFor(null)}>
        <EmojiPicker onEmojiSelected={handlePickerSelect} />
      </CustomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messages: {
    padding: 16,
    paddingTop: 64,
    gap: 10,
  },
  row: {
    maxWidth: '80%',
  },
  rowTheirs: {
    alignSelf: 'flex-start',
  },
  rowMine: {
    alignSelf: 'flex-end',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleTheirs: {
    backgroundColor: '#E9E9EB',
    borderBottomLeftRadius: 4,
  },
  bubbleMine: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  text: {
    fontSize: 15,
    color: '#1C1C1E',
  },
  textMine: {
    color: '#FFF',
  },
  chips: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  chip: {
    backgroundColor: 'rgba(118,118,128,0.12)',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  chipText: {
    fontSize: 13,
  },
  bar: {
    position: 'absolute',
    zIndex: 10,
  },
  barTheirs: {
    left: 16,
  },
  barMine: {
    right: 16,
  },
});
