import type { PickerListItem } from './engineContract';
import type { EmojiCategoryKey, EmojiItem } from './types';

export interface FlattenedList {
  items: PickerListItem[];
  stickyHeaderIndices: number[];
  headerIndexByCategory: Partial<Record<EmojiCategoryKey, number>>;
}

export interface CategorySection {
  category: EmojiCategoryKey;
  title: string;
  emojis: EmojiItem[];
}

function chunkIntoRows(
  category: EmojiCategoryKey,
  emojis: EmojiItem[],
  numColumns: number,
  items: PickerListItem[]
): void {
  for (let i = 0; i < emojis.length; i += numColumns) {
    const rowEmojis = emojis.slice(i, i + numColumns);
    items.push({
      type: 'row',
      key: `r-${category}-${rowEmojis[0]!.slug}`,
      category,
      emojis: rowEmojis,
    });
  }
}

/** Sections → header + row items, with sticky indices for the headers. */
export function flattenSections(
  sections: CategorySection[],
  numColumns: number
): FlattenedList {
  const items: PickerListItem[] = [];
  const stickyHeaderIndices: number[] = [];
  const headerIndexByCategory: FlattenedList['headerIndexByCategory'] = {};

  for (const section of sections) {
    if (section.emojis.length === 0) continue;
    headerIndexByCategory[section.category] = items.length;
    stickyHeaderIndices.push(items.length);
    items.push({
      type: 'header',
      key: `h-${section.category}`,
      category: section.category,
      title: section.title,
    });
    chunkIntoRows(section.category, section.emojis, numColumns, items);
  }

  return { items, stickyHeaderIndices, headerIndexByCategory };
}

/** Headerless rows for search results. */
export function flattenSearchResults(
  results: EmojiItem[],
  numColumns: number
): FlattenedList {
  const items: PickerListItem[] = [];
  for (let i = 0; i < results.length; i += numColumns) {
    const rowEmojis = results.slice(i, i + numColumns);
    items.push({
      type: 'row',
      key: `s-${rowEmojis[0]!.slug}`,
      category: rowEmojis[0]!.category,
      emojis: rowEmojis,
    });
  }
  return { items, stickyHeaderIndices: [], headerIndexByCategory: {} };
}
