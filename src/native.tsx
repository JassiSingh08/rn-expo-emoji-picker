import { createEmojiPicker } from './core/EmojiPickerCore';
import { NativeEmojiRow, isNativeEmojiRowAvailable } from './core/NativeEmojiRow';
import { FlashListEngine } from './engines/flashlist';

/**
 * Native-rows entry point — `import { EmojiPicker } from 'rn-s-emogi-picker/native'`.
 *
 * Each row of glyphs renders as ONE native view (CoreText on iOS, canvas
 * drawing on Android) instead of one Text per emoji. Requires a dev build
 * (Expo Modules autolinking); in Expo Go or any build without the native
 * module it silently falls back to the JS rows, so it is always safe to
 * import in an Expo app.
 */
export const EmojiPicker = createEmojiPicker(FlashListEngine, NativeEmojiRow);
export default EmojiPicker;

export { isNativeEmojiRowAvailable, NativeEmojiRow };
export { FlashListEngine };
export * from './shared-exports';
