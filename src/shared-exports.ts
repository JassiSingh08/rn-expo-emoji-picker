export { createEmojiPicker } from './core/EmojiPickerCore';
export { darkTheme, lightTheme } from './core/theme';
export { defaultStrings } from './core/strings';
export { createInMemoryStorage } from './core/storage';
export { applyToneToTemplate, displayEmoji, SKIN_TONES, toUnicodeString } from './core/skinTone';
export { detectMaxEmojiVersion, DEVICE_MAX_EMOJI_VERSION } from './core/deviceEmojiVersion';

export type {
  EmojiCategoryKey,
  EmojiDataCategoryKey,
  EmojiItem,
  EmojiPickerProps,
  EmojiPickerStorage,
  EmojiPickerStrings,
  EmojiPickerStringsOverride,
  EmojiPickerTheme,
  EmojiPickerThemeOverride,
  EmojiSelection,
  SkinTone,
} from './core/types';
export type {
  EmojiListEngine,
  EmojiListEngineProps,
  EmojiListHandle,
  EmojiListViewToken,
  PickerListItem,
} from './core/engineContract';
