import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const INITIAL_MESSAGES: Message[] = [
  { id: 'm1', text: 'Yo! The picker demo looks 🔥', mine: false },
  {
    id: 'm2',
    text: 'Native rows just landed — zero blank cells on my 4-year-old Android',
    mine: true,
  },
  { id: 'm3', text: 'Long-press this message to react 👀', mine: false },
  { id: 'm4', text: 'Tap 😊 in the composer — the input stays visible', mine: true },
];

const BAR_HEIGHT = 46;

export function ChatDemo() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [reactions, setReactions] = useState<Record<string, string[]>>({});
  const [barFor, setBarFor] = useState<Message | null>(null);
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [keyboardShown, setKeyboardShown] = useState(false);
  const rowTops = useRef<Record<string, number>>({});
  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const measuredKeyboard = useRef(0);

  useEffect(() => {
    // "Will" events on iOS so the spacer appears with the keyboard, not
    // after its animation; Android only emits "Did".
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        measuredKeyboard.current = e.endCoordinates.height;
        setKeyboardShown(true);
        setEmojiOpen(false);
      }
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardShown(false)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // One height for the keyboard spacer AND the emoji panel, so toggling
  // between them never moves the input bar. The screen bottom already sits
  // insets.bottom above the keyboard's bottom edge on iOS.
  const panelHeight = measuredKeyboard.current
    ? measuredKeyboard.current - (Platform.OS === 'ios' ? insets.bottom : 0)
    : 320;

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

  const toggleEmojiPanel = useCallback(() => {
    if (emojiOpen) {
      setEmojiOpen(false);
      inputRef.current?.focus();
    } else {
      Keyboard.dismiss();
      setEmojiOpen(true);
    }
  }, [emojiOpen]);

  const handleComposerEmoji = useCallback((e: EmojiSelection) => {
    setDraft((d) => d + e.emoji);
  }, []);

  const handleSend = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: `m${prev.length + 1}`, text, mine: true },
    ]);
    setDraft('');
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, [draft]);

  return (
    <View style={styles.container}>
      <View style={styles.chatArea}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.messages}>
          {messages.map((m) => (
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
      </View>

      <View style={styles.composer}>
        <Pressable onPress={toggleEmojiPanel} hitSlop={8} style={styles.emojiToggle}>
          <Text style={styles.emojiToggleText}>{emojiOpen ? '⌨️' : '😊'}</Text>
        </Pressable>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Message"
          placeholderTextColor="#8E8E93"
          multiline
        />
        <Pressable
          onPress={handleSend}
          style={[styles.send, !draft.trim() && styles.sendDisabled]}
        >
          <Text style={styles.sendText}>↑</Text>
        </Pressable>
      </View>

      {/* The picker replaces the keyboard, WhatsApp-style: the composer
          stays visible above it, so every tapped emoji shows up in the
          input immediately. When the system keyboard is up instead, an
          equal-height spacer keeps the composer above it — same mechanism,
          so the keyboard ⇄ panel swap never moves the input bar. */}
      {emojiOpen ? (
        <View style={{ height: panelHeight }}>
          <EmojiPicker
            onEmojiSelected={handleComposerEmoji}
            categoryBarPosition="hidden"
          />
        </View>
      ) : keyboardShown ? (
        <View style={{ height: panelHeight }} />
      ) : null}

      <CustomSheet visible={pickerFor != null} onClose={() => setPickerFor(null)}>
        <EmojiPicker
          onEmojiSelected={handlePickerSelect}
          categoryBarPosition="hidden"
        />
      </CustomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatArea: {
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
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.35)',
  },
  emojiToggle: {
    paddingBottom: 7,
  },
  emojiToggleText: {
    fontSize: 24,
  },
  input: {
    flex: 1,
    maxHeight: 96,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(128,128,128,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 16,
  },
  send: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  sendDisabled: {
    opacity: 0.35,
  },
  sendText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
