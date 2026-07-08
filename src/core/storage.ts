import type { EmojiPickerStorage } from './types';

/** Volatile storage — recents survive remounts but not app restarts. */
export function createInMemoryStorage(): EmojiPickerStorage {
  const store = new Map<string, string>();
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
}

/** Module-level singleton used when no `storage` prop is provided. */
export const defaultStorage = createInMemoryStorage();
