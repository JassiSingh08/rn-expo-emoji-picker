import { createEmojiPicker } from './core/EmojiPickerCore';
import { NativeEmojiRow, isNativeEmojiRowAvailable } from './core/NativeEmojiRow';
import { LegendListEngine } from './engines/legendlist';

/**
 * LegendList engine + native rows —
 * `import { EmojiPicker } from 'rn-expo-emoji-picker/legend-native'`.
 *
 * Needs `@legendapp/list` and a dev build for the native renderer; falls
 * back to JS rows wherever the native module isn't linked (Expo Go).
 * No dependency on @shopify/flash-list.
 */
export const EmojiPicker = createEmojiPicker(LegendListEngine, NativeEmojiRow);
export default EmojiPicker;

export { isNativeEmojiRowAvailable, NativeEmojiRow };
export { LegendListEngine };
export * from './shared-exports';
