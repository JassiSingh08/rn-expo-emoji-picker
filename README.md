# rn-expo-emoji-picker

[![New Architecture Only](https://img.shields.io/badge/New%20Architecture-required-blue)](https://reactnative.dev/architecture/landing-page)
[![Expo SDK 53 / 54](https://img.shields.io/badge/Expo-SDK%2053%20%2F%2054-lightgrey)](https://expo.dev)
[![MIT](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

Buttery-smooth emoji picker for React Native, built for the **New Architecture** with a **swappable list engine** (FlashList v2 by default, LegendList or FlatList via subpath imports) and an optional **native row renderer** for dev builds.

Works in any New-Architecture React Native app — **with or without Expo** (see [Using without Expo](#using-without-expo-bare-react-native)).

> ⚠️ **This library requires the React Native New Architecture.** Expo SDK 53 and 54 enable it by default, so most apps need to do nothing. The default FlashList v2 engine is itself New-Arch-only.

- 🚀 100% JavaScript core — **zero required native modules**, works in Expo Go (SDK 53/54) and any dev build
- ⚡ Optional **native row renderer** (`/native` entry, Expo Modules) — one native view per row for maximum scroll/jump throughput in dev builds, automatic JS fallback in Expo Go
- 🔁 Swappable list engine behind one adapter contract; install only the engine you use
- 🎨 Full theming (light/dark/auto + theme object), i18n-ready strings
- 🖐 Skin tones: global selector + per-emoji variants on long-press (controlled or uncontrolled)
- 🕘 Recently / frequently used, persisted through an injectable storage adapter
- 💬 `EmojiReactionBar` — WhatsApp-style quick reaction bar companion, with selected-state highlights and a ＋ hook into the full picker
- 🔍 Debounced keyword search over a **build-time prebuilt index** (nothing parsed at runtime)
- 📑 Category tab bar with sticky section headers and scroll-position highlighting
- 📱 Plays nicely inside `@gorhom/bottom-sheet` via an injectable `ScrollComponent`

## Install

```sh
npm install rn-expo-emoji-picker @shopify/flash-list
# or, if you prefer LegendList as the engine:
npm install rn-expo-emoji-picker @legendapp/list
```

`@shopify/flash-list` and `@legendapp/list` are **optional peer dependencies** — install only the one that matches the entry point you import. The `/flatlist` entry point needs neither. The native row renderer ships **inside this package** (Expo Modules) — nothing extra to install; it links automatically in any dev build when you import a `/native` entry.

Requirements: `react >= 19`, `react-native >= 0.79` (Expo SDK 53/54), New Architecture enabled.

### Using without Expo (bare React Native)

The picker's core is pure JS — in a bare React Native app, install and import exactly as above and everything works.

The optional **native row renderer** is an Expo Module, so it needs the Expo Modules runtime in your app. One-time setup:

```sh
npx install-expo-modules@latest
```

After that, the `/native` and `/legend-native` entries link automatically on the next build. Without it they still work — they detect the missing module and fall back to the JS rows (with a one-time `console.warn` in development).

## Quick start

```tsx
import { EmojiPicker } from 'rn-expo-emoji-picker';

export function MyScreen() {
  return (
    <EmojiPicker
      onEmojiSelected={(e) => {
        // { emoji: '👋🏽', unicode: '1F44B-1F3FD', name: 'waving hand',
        //   category: 'people_body', skinTone: 'medium', baseEmoji: '👋' }
        console.log(e.emoji);
      }}
    />
  );
}
```

The picker fills its parent (`flex: 1`), so give it a bounded height (a screen, a sheet, a modal…).

## Choosing a list engine

All picker logic lives behind an engine-agnostic adapter contract. Each entry point wires in a different engine — pick **one** and install its matching peer:

| Import | Engine | Install | Notes |
| --- | --- | --- | --- |
| `rn-expo-emoji-picker` | [FlashList v2](https://shopify.github.io/flash-list/) | `@shopify/flash-list@^2` | **Default & recommended.** New-Arch-only, JS-only, auto-measuring, recycling item pools. |
| `rn-expo-emoji-picker/legend` | [LegendList v3](https://legendapp.com/open-source/list/) | `@legendapp/list@^3` | New-Arch-optimized, JS-only. The adapter enables `recycleItems` (LegendList does not recycle by default) and passes an exact `estimatedItemSize`. |
| `rn-expo-emoji-picker/flatlist` | React Native FlatList | — | Fallback for apps stuck on the legacy architecture. Reduced performance, no sticky headers. |
| `rn-expo-emoji-picker/native` | FlashList v2 + **native rows** | `@shopify/flash-list@^2` + a dev build | FlashList engine with each row drawn as ONE native view (Expo Modules). Falls back to JS rows automatically when the native module isn't linked (Expo Go), so it's always safe to import in an Expo app. |
| `rn-expo-emoji-picker/legend-native` | LegendList + **native rows** | `@legendapp/list@^3` + a dev build | The same native row renderer and fallback, on the LegendList engine. |

```tsx
import { EmojiPicker } from 'rn-expo-emoji-picker';               // FlashList v2
import { EmojiPicker } from 'rn-expo-emoji-picker/legend';        // LegendList
import { EmojiPicker } from 'rn-expo-emoji-picker/flatlist';      // FlatList fallback
import { EmojiPicker } from 'rn-expo-emoji-picker/native';        // FlashList + native rows
import { EmojiPicker } from 'rn-expo-emoji-picker/legend-native'; // LegendList + native rows
```

How to pick:

- **Shipping dev builds** (most production apps): use `/native` — or `/legend-native` if your app already ships LegendList. You get native row rendering, and the same import still works in Expo Go via the JS fallback.
- **Staying JS-only / Expo Go**: use the default — or `/legend` to match an existing LegendList dependency. FlashList v2 and LegendList are both excellent New-Arch, JS-only engines; avoid shipping two list libraries.
- **Legacy architecture**: `/flatlist`, at reduced performance.

You can even bring your own engine: `createEmojiPicker(MyEngine)` is exported, together with the `EmojiListEngineProps` / `EmojiListHandle` contract types (an optional second argument swaps the row renderer).

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `onEmojiSelected` | `(e: EmojiSelection) => void` | **required** | Called with `{ emoji, unicode, name, category, skinTone, baseEmoji }`. |
| `numColumns` | `number` | `8` | Emoji per row. |
| `categories` | `EmojiDataCategoryKey[]` | all | Subset and order of categories. |
| `maxEmojiVersion` | `number \| null \| 'auto'` | `'auto'` | Hide emoji newer than this Unicode Emoji version so unsupported glyphs never show as tofu. `'auto'` detects the device's support from its OS version — see below. `null` shows everything, a number pins a version. |
| `colorScheme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Base appearance; `'auto'` follows the system. |
| `theme` | `EmojiPickerThemeOverride` | — | Partial theme merged over the light/dark base (colors, emoji size, header sizes…). |
| `strings` | `EmojiPickerStringsOverride` | English | Localized category names, search placeholder, empty state, a11y labels. |
| `enableSearch` | `boolean` | `true` | Show the search bar. |
| `searchDebounceMs` | `number` | `250` | Keyword-search debounce. |
| `enableRecentlyUsed` | `boolean` | `true` | Show the recently-used section. |
| `recentlyUsedLimit` | `number` | `16` | Max emoji in the recents section. |
| `storage` | `EmojiPickerStorage` | in-memory | Persistence for recents — see below. |
| `storageKey` | `string` | `'rn-expo-emoji-picker:recents'` | Storage key for recents. |
| `enableSkinToneSelector` | `boolean` | `true` | Show the global skin tone button. |
| `skinTone` | `SkinTone` | — | Controlled skin tone (`'default' \| 'light' \| 'medium_light' \| 'medium' \| 'medium_dark' \| 'dark'`). |
| `defaultSkinTone` | `SkinTone` | `'default'` | Initial tone when uncontrolled. |
| `onSkinToneChange` | `(tone: SkinTone) => void` | — | Fires from the global selector. |
| `ScrollComponent` | `ComponentType<any>` | — | Injected scroll component (bottom sheets — see below). |
| `onCategoryChanged` | `(c: EmojiCategoryKey) => void` | — | Active category changed (scrolling or tab press). |
| `headerRight` | `ReactNode` | — | Extra element after the search bar / tone button — e.g. a backspace key for chat inputs. |
| `categoryBarPosition` | `'top' \| 'bottom' \| 'hidden'` | `'top'` | `'bottom'` matches system-keyboard layouts. `'hidden'` removes the bar entirely — recently used still appears as the top section of the list, and the list keeps its scroll position when that section grows. |
| `excludeEmojis` | `string[]` | — | Glyphs to hide entirely (matched against the base emoji). |
| `style` | `StyleProp<ViewStyle>` | — | Container style. |
| `contentContainerStyle` | `StyleProp<ViewStyle>` | — | Forwarded to the list. |

Long-pressing any emoji that supports skin tones opens an anchored variant popover directly above the pressed cell (WhatsApp/Gboard style, flipping below near the top edge); picking a variant does not change the global tone.

### How `maxEmojiVersion: 'auto'` decides

The dataset ships everything through **Emoji 17.0** (Unicode 17.0, 2025). What a device can *render* depends on its OS:

- **Android with the native module linked** (any dev build — whichever entry point you import): the picker asks the device's emoji font which glyphs it can actually draw (`Paint.hasGlyph`, the same check EmojiCompat uses) and hides the rest. This catches Samsung and other OEM fonts, and Play-updated fonts that are ahead of the OS. It runs once per app launch on a native background thread, so the picker never waits for it, and only checks the ~350 emoji newer than Emoji 5.0.
- **Android without it** (Expo Go): capped at the version the OS release shipped — Android 16 → 16, 15 → 15.1, 14 → 15, 13 → 14, 12 → 13.1, 11 → 13, 10 → 12, older → 11. A device with a newer font misses a few recent emoji rather than showing tofu.
- **iOS**: capped by the OS point release that shipped each emoji set (iOS 26.4 → all, 18.4 → 16, 17.4 → 15.1, 16.4 → 15, 15.4 → 14, 14.2 → 13, older → 12).

The OS-version value is exported as `DEVICE_MAX_EMOJI_VERSION` (`detectMaxEmojiVersion()`) if you want it for your own UI.

## Persisting recently used

Core ships with zero storage dependencies. The default adapter is in-memory (resets on app restart). Anything with `getItem`/`setItem` works, sync or async — `@react-native-async-storage/async-storage` satisfies the interface directly:

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

<EmojiPicker onEmojiSelected={...} storage={AsyncStorage} />
```

[react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) works too and is the fastest option — it's synchronous, so recents are available on first render with no async flash. Its API is `getString`/`set`, so wrap it in a two-line adapter:

```tsx
import { MMKV } from 'react-native-mmkv';
import type { EmojiPickerStorage } from 'rn-expo-emoji-picker';

const mmkv = new MMKV();
const mmkvStorage: EmojiPickerStorage = {
  getItem: (key) => mmkv.getString(key) ?? null,
  setItem: (key, value) => mmkv.set(key, value),
};

<EmojiPicker onEmojiSelected={...} storage={mmkvStorage} />
```

Note: MMKV is a native module, so it requires a dev build (it won't run in Expo Go). The picker itself stays JS-only either way — the native dependency lives in *your* app, not in this library.

## Reaction bar (chat apps)

`EmojiReactionBar` is the quick-reaction companion to the full picker — the small pill of emojis that appears when a user long-presses a message. It's a plain view: anchor it over your message bubble yourself, and wire `onOpenPicker` to present the full `EmojiPicker` (in a sheet, modal, wherever).

```tsx
import { EmojiReactionBar } from 'rn-expo-emoji-picker';

<EmojiReactionBar
  emojis={['👍', '❤️', '😂', '😮', '😢', '🙏']}   // default set shown
  selectedEmojis={myReactionsForThisMessage}       // rendered highlighted
  onEmojiSelected={(e) => toggleReaction(e.emoji)} // same EmojiSelection payload
  onOpenPicker={() => setSheetOpen(true)}          // renders the ＋ button
/>
```

Props: `emojis`, `selectedEmojis`, `onEmojiSelected`, `onOpenPicker`, `colorScheme`, `theme`, `emojiSize`, `style`. Tapping an already-selected emoji fires `onEmojiSelected` again — treat it as "remove reaction". The example app's chat screen shows the full flow.

The bar ships **without any animation or positioning opinion** — it's a plain view, so your app owns both. Anchor it over the message via a wrapper, and animate with whatever your app already uses. With Reanimated (entering **and** exiting both work, since your wrapper owns mount/unmount):

```tsx
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';

{barVisible && (
  <Animated.View
    entering={FadeInUp.springify()}
    exiting={FadeOut}
    style={{ position: 'absolute', top: bubbleY - 52, left: 16 }}
  >
    <EmojiReactionBar
      selectedEmojis={reactions}
      onEmojiSelected={(e) => toggleReaction(e.emoji)}
      onOpenPicker={openSheet}
    />
  </Animated.View>
)}
```

## Chat composer (emoji keyboard)

The other big chat use case: the picker replaces the system keyboard, WhatsApp-style, while the input bar stays visible above it — so every tapped emoji appears in the text field immediately. The picker is a plain view, so this is just layout: put it below your composer at the keyboard's height, and toggle between it and the keyboard.

Skip `KeyboardAvoidingView` here — treat the system keyboard and the emoji panel as the same thing: one slot below the composer that holds either the picker or an equal-height spacer. This works with Android edge-to-edge (where the window no longer resizes for the keyboard) and makes the keyboard ⇄ panel swap pixel-stable, because both occupy the identical height.

```tsx
import { Keyboard, Platform, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmojiPicker } from 'rn-expo-emoji-picker/native';

const [draft, setDraft] = useState('');
const [emojiOpen, setEmojiOpen] = useState(false);
const [keyboardShown, setKeyboardShown] = useState(false);
const inputRef = useRef<TextInput>(null);
const measuredKeyboard = useRef(0);
const insets = useSafeAreaInsets();

useEffect(() => {
  // "Will" events on iOS so the spacer moves with the keyboard animation;
  // Android only emits "Did".
  const show = Keyboard.addListener(
    Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
    (e) => {
      measuredKeyboard.current = e.endCoordinates.height;
      setKeyboardShown(true);
      setEmojiOpen(false); // tapping the input swaps the panel back out
    }
  );
  const hide = Keyboard.addListener(
    Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
    () => setKeyboardShown(false)
  );
  return () => { show.remove(); hide.remove(); };
}, []);

// Your screen bottom already sits insets.bottom above the keyboard's
// bottom edge on iOS. 320 is the fallback before the keyboard first shows.
const panelHeight = measuredKeyboard.current
  ? measuredKeyboard.current - (Platform.OS === 'ios' ? insets.bottom : 0)
  : 320;

const toggle = () => {
  if (emojiOpen) {
    setEmojiOpen(false);
    inputRef.current?.focus();      // panel → keyboard
  } else {
    Keyboard.dismiss();             // keyboard → panel
    setEmojiOpen(true);
  }
};

<View style={{ flex: 1 }}>
  {/* messages */}
  <Composer inputRef={inputRef} value={draft} onChangeText={setDraft} onEmojiPress={toggle} />
  {emojiOpen ? (
    <View style={{ height: panelHeight }}>
      <EmojiPicker onEmojiSelected={(e) => setDraft((d) => d + e.emoji)} />
    </View>
  ) : keyboardShown ? (
    <View style={{ height: panelHeight }} />   // keeps the composer above the keyboard
  ) : null}
</View>
```

Don't close the panel on selection — users typically insert several emoji in a row. The example app's chat screen has the complete working version (composer + reactions together).

## Theming

```tsx
<EmojiPicker
  colorScheme="dark"                 // or 'light' / 'auto'
  theme={{
    colors: { accent: '#FF2D55', background: '#101014' },
    emojiSize: 32,                   // row height = emojiSize + 2 * cellPadding
  }}
  onEmojiSelected={...}
/>
```

`lightTheme` and `darkTheme` are exported if you want to build on them.

## Inside a bottom sheet (@gorhom/bottom-sheet)

Vertical lists inside a bottom sheet fight the sheet's pan gesture on Android. Inject the sheet-aware scroll component and the gestures compose correctly:

```tsx
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { EmojiPicker } from 'rn-expo-emoji-picker';

<BottomSheet snapPoints={['60%']}>
  <EmojiPicker onEmojiSelected={...} ScrollComponent={BottomSheetScrollView} />
</BottomSheet>
```

Any custom sheet works the same way — pass whatever scroll component your sheet needs the list to render.

## i18n

```tsx
<EmojiPicker
  strings={{
    searchPlaceholder: 'Buscar emoji',
    noResults: 'Sin resultados',
    categories: { smileys_emotion: 'Caritas y emociones', flags: 'Banderas' },
  }}
  onEmojiSelected={...}
/>
```

Emoji **keywords** stay in the data layer (English, from [emojilib](https://github.com/muan/emojilib)); the `strings` prop localizes the UI.

## Performance

- **Row-based grid** — the list renders whole rows, never cells: one item shape across engines, clean recycling pools, uniform row height (`emojiSize + 2 * cellPadding`).
- **One component per row** — a single `Pressable` of plain `Text` glyphs; the tapped emoji is resolved from the touch x-position. Rows are stateless and `React.memo`, so recycling re-binds stay cheap on low-end devices.
- **Build-time data** — the emoji index (from [unicode-emoji-json](https://github.com/muan/unicode-emoji-json)) ships precomputed; nothing is parsed on mount, and skin toning is a string substitution.

### Native row rendering (`/native`, `/legend-native`)

In dev builds, each row is drawn by **one native view** (Expo Modules — UIKit string drawing on iOS, canvas text on Android) instead of one `Text` per emoji, dropping a recycled window from ~180 views to ~20. No config plugin needed — any `expo run:*` / dev-client / EAS build links it automatically. Where the module isn't linked (Expo Go included) it **falls back to the JS rows** with a one-time dev warning; `isNativeEmojiRowAvailable` reports which path is active. Touch handling and search stay in JS on both paths, so behavior is identical.

#### Measured difference

**Release build**, 2021 Android phone, identical FlashList and data (238 rows / 1,904 emoji), auto-fling at 4× finger speed. Reproduce it yourself with the example app's benchmark screen:

| | JS rows | Native rows | |
| --- | --- | --- | --- |
| Scroll — JS FPS (avg / min) | 11.9 / 10.7 | **58.4 / 58.2** | **~5× faster** |
| Full-list jump — paint (avg / max) | 349 / 382 ms | 312 / 332 ms | ~10% faster |

## Example app

[`example/`](./example) is an Expo SDK 54 app with eight screens: the default FlashList picker, the LegendList engine (`/legend`), a dark custom theme (with oversized tabs demonstrating the auto-scrolling category bar), the picker inside a custom bottom sheet, a kitchen-sink screen exercising every prop (controlled skin tone, `headerRight` erase key, bottom category bar, excluded emoji, 9 columns), the native row renderer (`/native`) with a badge showing whether the native path is active, a chat screen demoing `EmojiReactionBar` (long-press a message → quick bar → ＋ opens the full picker) plus a composer where 😊 swaps the keyboard for the picker while the input bar stays in view, and the JS-vs-native **row benchmark** behind the numbers above.

```sh
npm install && npm run prepare   # build the library
cd example && npm install
npx expo start                   # Expo Go — native rows fall back to JS
npx expo run:ios                 # dev build — native rows ACTIVE
npx expo run:android
```

## License

[MIT](./LICENSE) © Jass (Scanner Techs)
