import React, { memo, useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { FlashList, useBenchmark } from '@shopify/flash-list';
import { lightTheme } from 'rn-expo-emoji-picker';
import {
  isNativeEmojiRowAvailable,
  NativeEmojiRow,
} from 'rn-expo-emoji-picker/native';
import type { FlashListRef } from '@shopify/flash-list';
import type { EmojiItem } from 'rn-expo-emoji-picker';

const NUM_COLUMNS = 8;
const ROW_HEIGHT = lightTheme.emojiSize + lightTheme.cellPadding * 2;
const TOTAL_EMOJI = 1904; // matches the real dataset size
const JUMP_COUNT = 10;

// prettier-ignore
const GLYPHS = [
  '😀','😂','🥹','😍','🤪','😎','🥳','😭','😡','🤯','🥶','😴','🤥','🫠','😇','🤖',
  '👋','🤙','💪','🙏','👀','🧠','👨‍💻','🧑‍🚀','🦸','🧟','💃','🏃','👨‍👩‍👧','🫶','✍️','🦻',
  '🐶','🐱','🦊','🐼','🦁','🐷','🐸','🦄','🐢','🐙','🦋','🌵','🌸','🍀','🌈','⭐',
  '🍕','🍔','🌮','🍣','🍜','🍩','🎂','🍫','☕','🧋','🍺','🥑','🍉','🍇','🥨','🧀',
  '⚽','🏀','🎾','🏓','🎮','🎲','🎸','🎹','🎬','🎨','🏆','🥇','🎯','🎳','🛹','🏄',
  '🚗','✈️','🚀','🚲','🛸','⛵','🚂','🏝️','🗻','🏰','🎡','🌋','🗽','⛺','🌃','🛰️',
  '💡','📱','💻','⌚','📷','🔋','🔑','💎','🧲','🔭','🧪','💊','🧸','🎁','📚','✏️',
  '❤️','💕','✨','🔥','💯','✅','⚠️','🎉','♻️','🆒','➕','❓','💤','🔔','🏁','🎈',
];

// The rows are what the picker feeds its Row component; glyph uniqueness is
// irrelevant to recycling cost, so a repeated bank at real dataset size is a
// fair stand-in without importing library internals.
const ROWS: Array<{ key: string; emojis: EmojiItem[] }> = (() => {
  const items: EmojiItem[] = Array.from({ length: TOTAL_EMOJI }, (_, i) => ({
    emoji: GLYPHS[i % GLYPHS.length]!,
    name: `emoji ${i}`,
    slug: `bench_${i}`,
    category: 'smileys_emotion',
    version: 1,
    keywords: '',
    toneTemplate: null,
  }));
  const rows = [];
  for (let i = 0; i < items.length; i += NUM_COLUMNS) {
    rows.push({ key: `r${i}`, emojis: items.slice(i, i + NUM_COLUMNS) });
  }
  return rows;
})();

const noop = () => {};

type RowProps = React.ComponentProps<typeof NativeEmojiRow>;
type ListRef = React.RefObject<FlashListRef<(typeof ROWS)[number]>>;

// FlashList 2.0.2's useBenchmark auto-starts on mount, so mounting this is
// the "start" button.
function ScrollBench({
  listRef,
  onDone,
}: {
  listRef: ListRef;
  onDone: (result: { js?: { averageFPS: number; minFPS: number }; interrupted: boolean }) => void;
}) {
  useBenchmark(listRef, onDone, {
    // 3 full-list passes well above finger-fling speed.
    startDelayInMs: 500,
    speedMultiplier: 4,
    repeatCount: 3,
  });
  return null;
}

// Replica of the library's internal JS EmojiRow (one Pressable, plain Texts)
// so the benchmark doesn't need the core package to export internals.
const JSRow = memo(function JSRow({ emojis, rowHeight, emojiSize }: RowProps) {
  return (
    <Pressable style={[styles.jsRow, { height: rowHeight }]} onPress={noop}>
      {emojis.map((item) => (
        <Text
          key={item.slug}
          style={[styles.jsCell, { fontSize: emojiSize }]}
          allowFontScaling={false}
        >
          {item.emoji}
        </Text>
      ))}
    </Pressable>
  );
});

/**
 * Apples-to-apples row benchmark: identical FlashList, identical data —
 * the ONLY variable is the row renderer (JS Texts vs one native view).
 */
export function BenchmarkScreen() {
  const [useNative, setUseNative] = useState(isNativeEmojiRowAvailable);
  // Keyed by "<mode> · <test>" so JS and native results stay side by side.
  const [results, setResults] = useState<Record<string, string>>({});
  const listRef = useRef<FlashListRef<(typeof ROWS)[number]>>(null);
  const jumpState = useRef<{
    start: number;
    target: number;
    results: number[];
    step: () => void;
  } | null>(null);

  const [benchRunning, setBenchRunning] = useState(false);
  const fg = useColorScheme() === 'dark' ? '#FFF' : '#1C1C1E';

  const Row = useNative ? NativeEmojiRow : JSRow;
  const modeLabel = useNative ? 'NATIVE rows' : 'JS rows';
  // Results are set from stable callbacks; read the mode through a ref so
  // each result is stamped with the renderer that actually produced it.
  const modeRef = useRef(modeLabel);
  modeRef.current = modeLabel;

  const handleBenchDone = useCallback(
    (res: { js?: { averageFPS: number; minFPS: number }; interrupted: boolean }) => {
      setBenchRunning(false);
      if (res.interrupted || !res.js) return;
      const js = res.js;
      setResults((prev) => ({
        ...prev,
        [`${modeRef.current} · scroll`]: `JS FPS avg ${js.averageFPS.toFixed(1)} / min ${js.minFPS.toFixed(1)}`,
      }));
    },
    []
  );

  const startBenchmark = useCallback(() => {
    setBenchRunning(true);
  }, []);

  const handleViewable = useRef(
    (info: { viewableItems: Array<{ index?: number | null }> }) => {
      const jump = jumpState.current;
      if (!jump) return;
      const arrived = info.viewableItems.some(
        (t) => t.index != null && Math.abs(t.index - jump.target) <= NUM_COLUMNS
      );
      if (arrived) {
        jump.results.push(Date.now() - jump.start);
        jump.step();
      }
    }
  ).current;

  // Mimics tab presses: instant scrollToIndex across the whole dataset,
  // timed from the call until the target rows report viewable.
  const runJumpTest = useCallback(() => {
    setResults((prev) => ({ ...prev, [`${modeRef.current} · jump`]: 'jumping…' }));
    const results: number[] = [];
    let remaining = JUMP_COUNT;
    const step = () => {
      if (remaining === 0) {
        jumpState.current = null;
        const avg = results.reduce((a, b) => a + b, 0) / results.length;
        setResults((prev) => ({
          ...prev,
          [`${modeRef.current} · jump`]: `paint avg ${avg.toFixed(0)}ms / max ${Math.max(...results)}ms (${results.length} jumps)`,
        }));
        return;
      }
      const target = remaining % 2 === 0 ? ROWS.length - 5 : 5;
      remaining -= 1;
      jumpState.current = { start: Date.now(), target, results, step };
      listRef.current?.scrollToIndex({ index: target, animated: false });
    };
    step();
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: (typeof ROWS)[number] }) => (
      <Row
        emojis={item.emojis}
        category="smileys_emotion"
        numColumns={NUM_COLUMNS}
        rowHeight={ROW_HEIGHT}
        emojiSize={lightTheme.emojiSize}
        skinTone="default"
        onPress={noop}
        onLongPress={noop}
      />
    ),
    [Row]
  );

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <View style={styles.buttonRow}>
          <Pressable
            onPress={() => setUseNative(false)}
            style={[styles.toggle, !useNative && styles.toggleActive]}
          >
            <Text style={[styles.toggleText, { color: fg }]}>JS rows</Text>
          </Pressable>
          <Pressable
            onPress={() => isNativeEmojiRowAvailable && setUseNative(true)}
            style={[
              styles.toggle,
              useNative && styles.toggleActive,
              !isNativeEmojiRowAvailable && styles.disabled,
            ]}
          >
            <Text style={[styles.toggleText, { color: fg }]}>
              Native rows{isNativeEmojiRowAvailable ? ' ⚡' : ' (not linked)'}
            </Text>
          </Pressable>
        </View>
        <View style={styles.buttonRow}>
          <Pressable
            onPress={startBenchmark}
            disabled={benchRunning}
            style={[styles.run, benchRunning && styles.disabled]}
          >
            <Text style={styles.runText}>
              {benchRunning ? 'Running…' : 'Scroll benchmark'}
            </Text>
          </Pressable>
          <Pressable onPress={runJumpTest} style={styles.run}>
            <Text style={styles.runText}>Jump test</Text>
          </Pressable>
        </View>
        <Text style={styles.meta}>
          {ROWS.length} rows · {modeLabel} ·{' '}
          {__DEV__ ? 'DEV build (numbers inflated)' : 'RELEASE build'}
        </Text>
        {Object.entries(results).map(([label, value]) => (
          <Text key={label} style={[styles.result, { color: fg }]}>
            {label} · {value}
          </Text>
        ))}
      </View>
      {benchRunning && (
        <ScrollBench listRef={listRef as ListRef} onDone={handleBenchDone} />
      )}
      <FlashList
        // Remount on toggle so recycling pools never mix row components.
        key={useNative ? 'native' : 'js'}
        ref={listRef}
        data={ROWS}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        onViewableItemsChanged={handleViewable}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controls: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggle: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(118,118,128,0.12)',
  },
  toggleActive: {
    backgroundColor: 'rgba(0,122,255,0.25)',
  },
  disabled: {
    opacity: 0.4,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  run: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  runText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
    color: '#8E8E93',
  },
  result: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  jsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jsCell: {
    flex: 1,
    textAlign: 'center',
    pointerEvents: 'none',
  },
});
