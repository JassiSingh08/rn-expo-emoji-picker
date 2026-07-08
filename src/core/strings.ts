import type { EmojiCategoryKey, EmojiPickerStrings, EmojiPickerStringsOverride } from './types';

export const defaultStrings: EmojiPickerStrings = {
  searchPlaceholder: 'Search emoji',
  noResults: 'No emoji found',
  clearSearch: 'Clear search',
  skinToneSelector: 'Change default skin tone',
  categories: {
    recently_used: 'Recently used',
    smileys_emotion: 'Smileys & emotion',
    people_body: 'People & body',
    animals_nature: 'Animals & nature',
    food_drink: 'Food & drink',
    travel_places: 'Travel & places',
    activities: 'Activities',
    objects: 'Objects',
    symbols: 'Symbols',
    flags: 'Flags',
  },
};

export const CATEGORY_ICONS: Record<EmojiCategoryKey, string> = {
  recently_used: '🕘',
  smileys_emotion: '😀',
  people_body: '👋',
  animals_nature: '🐻',
  food_drink: '🍔',
  travel_places: '✈️',
  activities: '⚽',
  objects: '💡',
  symbols: '🔣',
  flags: '🏳️',
};

export function resolveStrings(
  override?: EmojiPickerStringsOverride
): EmojiPickerStrings {
  if (!override) return defaultStrings;
  return {
    ...defaultStrings,
    ...override,
    categories: { ...defaultStrings.categories, ...override.categories },
  };
}
