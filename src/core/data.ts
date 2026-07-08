import { EMOJI_DATA } from '../data/emoji-data';
import type { EmojiDataCategoryKey, EmojiItem } from './types';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Decoded exactly once at module load — never per mount.
const byCategory = new Map<EmojiDataCategoryKey, EmojiItem[]>();
const bySlug = new Map<string, EmojiItem>();

for (const group of EMOJI_DATA.groups) {
  const items: EmojiItem[] = [];
  for (const t of group.emojis) {
    // Names like "keycap #" / "keycap *" collide after slugification;
    // suffix so slugs stay unique (they key cells and recents entries).
    let slug = slugify(t[1]);
    while (bySlug.has(slug)) slug += '_';
    const item: EmojiItem = {
      emoji: t[0],
      name: t[1],
      slug,
      category: group.key,
      version: t[2],
      keywords: t[3],
      toneTemplate: t[4] ?? null,
    };
    items.push(item);
    bySlug.set(slug, item);
  }
  byCategory.set(group.key, items);
}

export const DATA_CATEGORY_ORDER: EmojiDataCategoryKey[] = EMOJI_DATA.groups.map(
  (g) => g.key
);

export function getEmojisForCategory(key: EmojiDataCategoryKey): EmojiItem[] {
  return byCategory.get(key) ?? [];
}

export function getEmojiBySlug(slug: string): EmojiItem | undefined {
  return bySlug.get(slug);
}
