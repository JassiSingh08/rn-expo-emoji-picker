import { createEmojiPicker } from './core/EmojiPickerCore';
import { FlashListEngine } from './engines/flashlist';

/**
 * Default entry point — FlashList v2 engine.
 * Requires the New Architecture and `@shopify/flash-list` >= 2.
 *
 * Other engines: `rn-expo-emoji-picker/legend`, `rn-expo-emoji-picker/flatlist`.
 */
export const EmojiPicker = createEmojiPicker(FlashListEngine);
export default EmojiPicker;

export { FlashListEngine };
export * from './shared-exports';
