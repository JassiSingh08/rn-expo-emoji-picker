import React, { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { createInMemoryStorage, EmojiPicker, EmojiReactionBar } from 'rn-expo-emoji-picker';
import { EmojiPicker as LegendEmojiPicker } from 'rn-expo-emoji-picker/legend';
import {
  EmojiPicker as NativeEmojiPicker,
  isNativeEmojiRowAvailable,
} from 'rn-expo-emoji-picker/native';
import type { EmojiCategoryKey, EmojiSelection, SkinTone } from 'rn-expo-emoji-picker';
import { ChatDemo } from './src/ChatDemo';
import { CustomSheet } from './src/CustomSheet';

type Screen =
  | 'home'
  | 'flashlist'
  | 'legend'
  | 'dark'
  | 'sheet'
  | 'kitchen'
  | 'native'
  | 'chat';

// Stable across remounts so the "Frequent" section survives navigation.
const kitchenStorage = createInMemoryStorage();

const DEMOS: Array<{ key: Screen; title: string; subtitle: string }> = [
  {
    key: 'flashlist',
    title: 'Default picker (FlashList v2)',
    subtitle: "import { EmojiPicker } from 'rn-expo-emoji-picker'",
  },
  {
    key: 'legend',
    title: 'LegendList engine',
    subtitle: "import { EmojiPicker } from 'rn-expo-emoji-picker/legend'",
  },
  {
    key: 'dark',
    title: 'Dark theme + custom accent',
    subtitle: 'theme override + oversized tabs (watch the bar auto-scroll)',
  },
  {
    key: 'sheet',
    title: 'Inside a custom bottom sheet',
    subtitle: 'ScrollComponent injection works for @gorhom too',
  },
  {
    key: 'kitchen',
    title: 'Kitchen sink (every prop)',
    subtitle: 'controlled tone, erase key, bottom tab bar, excluded emoji, 9 cols',
  },
  {
    key: 'native',
    title: 'Native rows (dev build)',
    subtitle: "import from 'rn-expo-emoji-picker/native' — JS fallback in Expo Go",
  },
  {
    key: 'chat',
    title: 'Chat reactions (EmojiReactionBar)',
    subtitle: 'long-press a message → quick bar → ＋ opens the full picker',
  },
];

function SelectionBanner({ selection }: { selection: EmojiSelection | null }) {
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerEmoji}>{selection?.emoji ?? '…'}</Text>
      <View style={styles.bannerText}>
        <Text style={styles.bannerName} numberOfLines={1}>
          {selection ? selection.name : 'Tap an emoji'}
        </Text>
        <Text style={styles.bannerMeta} numberOfLines={1}>
          {selection
            ? `${selection.unicode} · ${selection.category} · tone: ${selection.skinTone}`
            : 'Long-press for skin tone variants'}
        </Text>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selection, setSelection] = useState<EmojiSelection | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [kitchenTone, setKitchenTone] = useState<SkinTone>('medium');
  const [kitchenCategory, setKitchenCategory] =
    useState<EmojiCategoryKey>('smileys_emotion');
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  const handleSelected = useCallback((e: EmojiSelection) => {
    setSelection(e);
  }, []);

  const goHome = useCallback(() => {
    setScreen('home');
    setSheetOpen(false);
  }, []);

  const bg = dark ? '#000' : '#F2F2F7';
  const fg = dark ? '#FFF' : '#1C1C1E';

  if (screen === 'home') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
        <StatusBar style="auto" />
        <ScrollView contentContainerStyle={styles.home}>
          <Text style={[styles.title, { color: fg }]}>rn-expo-emoji-picker</Text>
          <Text style={styles.subtitle}>
            New Architecture · swappable list engine
          </Text>
          {DEMOS.map((demo) => (
            <Pressable
              key={demo.key}
              style={[styles.card, dark && styles.cardDark]}
              onPress={() => {
                setScreen(demo.key);
                if (demo.key === 'sheet') setSheetOpen(true);
              }}
            >
              <Text style={[styles.cardTitle, { color: fg }]}>{demo.title}</Text>
              <Text style={styles.cardSubtitle}>{demo.subtitle}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: screen === 'dark' ? '#101014' : bg },
      ]}
    >
      <StatusBar style={screen === 'dark' ? 'light' : 'auto'} />
      <View style={styles.topBar}>
        <Pressable onPress={goHome} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <SelectionBanner selection={selection} />
      </View>

      {screen === 'flashlist' && (
        <EmojiPicker onEmojiSelected={handleSelected} />
      )}

      {screen === 'legend' && (
        <LegendEmojiPicker onEmojiSelected={handleSelected} />
      )}

      {screen === 'dark' && (
        <EmojiPicker
          onEmojiSelected={handleSelected}
          colorScheme="dark"
          theme={{
            colors: {
              background: '#101014',
              accent: '#FF2D55',
              categoryActiveBackground: 'rgba(255,45,85,0.22)',
            },
            emojiSize: 30,
            // Oversized on purpose: overflows the bar so the active tab
            // auto-scrolls into view while you scroll the grid.
            categoryBarIconSize: 34,
          }}
        />
      )}

      {screen === 'native' && (
        <>
          <Text style={styles.kitchenMeta}>
            native row renderer:{' '}
            {isNativeEmojiRowAvailable ? 'ACTIVE ⚡' : 'not linked — JS fallback'}
          </Text>
          <NativeEmojiPicker onEmojiSelected={handleSelected} />
        </>
      )}

      {screen === 'chat' && <ChatDemo />}

      {screen === 'kitchen' && (
        <>
          <Text style={styles.kitchenMeta}>
            controlled tone: {kitchenTone} · active category: {kitchenCategory}
          </Text>
          <EmojiPicker
            onEmojiSelected={handleSelected}
            numColumns={9}
            categories={[
              'smileys_emotion',
              'animals_nature',
              'food_drink',
              'activities',
              'flags',
            ]}
            maxEmojiVersion={null} // show all 2026 glyphs; 'auto' is the default
            colorScheme="light"
            theme={{
              colors: {
                accent: '#34C759',
                categoryActiveBackground: 'rgba(52,199,89,0.18)',
                searchBackground: 'rgba(52,199,89,0.10)',
              },
              emojiSize: 24,
              cellPadding: 9,
              headerFontSize: 12,
              categoryBarIconSize: 22,
            }}
            strings={{
              searchPlaceholder: 'Find an emoji…',
              noResults: 'Nothing matches that',
              clearSearch: 'Clear',
              skinToneSelector: 'Pick default skin tone',
              categories: {
                recently_used: 'Frequent',
                smileys_emotion: 'Smileys',
                animals_nature: 'Nature',
                food_drink: 'Food',
                activities: 'Sports',
                flags: 'Flags',
              },
            }}
            enableSearch
            searchDebounceMs={150}
            enableRecentlyUsed
            recentlyUsedLimit={9}
            storage={kitchenStorage}
            storageKey="example:kitchen-recents"
            enableSkinToneSelector
            skinTone={kitchenTone}
            defaultSkinTone="medium" // ignored while controlled; here for completeness
            onSkinToneChange={setKitchenTone}
            ScrollComponent={ScrollView}
            onCategoryChanged={setKitchenCategory}
            headerRight={
              <Pressable
                onPress={() => setSelection(null)}
                style={styles.eraseButton}
                accessibilityRole="button"
                accessibilityLabel="erase"
              >
                <Text style={styles.eraseText}>⌫</Text>
              </Pressable>
            }
            categoryBarPosition="bottom"
            excludeEmojis={['🖕']}
            style={styles.kitchenPicker}
            contentContainerStyle={styles.kitchenContent}
          />
        </>
      )}

      {screen === 'sheet' && (
        <View style={styles.sheetDemo}>
          <Pressable
            style={styles.openButton}
            onPress={() => setSheetOpen(true)}
          >
            <Text style={styles.openButtonText}>Open emoji sheet</Text>
          </Pressable>
          <CustomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
            <EmojiPicker
              onEmojiSelected={(e) => {
                handleSelected(e);
                setSheetOpen(false);
              }}
            />
          </CustomSheet>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  home: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  cardDark: {
    backgroundColor: '#1C1C1E',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  back: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
  },
  banner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bannerEmoji: {
    fontSize: 32,
  },
  bannerText: {
    flex: 1,
  },
  bannerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  bannerMeta: {
    fontSize: 11,
    color: '#8E8E93',
  },
  sheetDemo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kitchenMeta: {
    fontSize: 12,
    color: '#8E8E93',
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  kitchenPicker: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  kitchenContent: {
    paddingBottom: 24,
  },
  eraseButton: {
    backgroundColor: 'rgba(52,199,89,0.10)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  eraseText: {
    fontSize: 18,
    color: '#1C1C1E',
  },
  openButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  openButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
