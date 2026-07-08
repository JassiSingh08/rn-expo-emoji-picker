import { createEmojiPicker } from './core/EmojiPickerCore';
import { FlatListEngine } from './engines/flatlist';

/**
 * FlatList entry point — `import { EmojiPicker } from 'rn-s-emogi-picker/flatlist'`.
 * Zero extra dependencies; reduced performance and no sticky headers.
 * Only use this if you are stuck on the legacy architecture.
 */
export const EmojiPicker = createEmojiPicker(FlatListEngine);
export default EmojiPicker;

export { FlatListEngine };
export * from './shared-exports';
