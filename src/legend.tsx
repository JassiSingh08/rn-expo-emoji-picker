import { createEmojiPicker } from './core/EmojiPickerCore';
import { LegendListEngine } from './engines/legendlist';

/**
 * LegendList entry point — `import { EmojiPicker } from 'rn-s-emogi-picker/legend'`.
 * Requires the New Architecture and `@legendapp/list`.
 */
export const EmojiPicker = createEmojiPicker(LegendListEngine);
export default EmojiPicker;

export { LegendListEngine };
export * from './shared-exports';
