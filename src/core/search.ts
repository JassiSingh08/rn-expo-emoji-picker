import type { EmojiItem } from './types';

/**
 * Keyword search over the prebuilt index. Every query token must match the
 * name or a keyword; name matches rank above keyword matches, prefix matches
 * above substring matches.
 */
export function searchEmojis(items: EmojiItem[], query: string): EmojiItem[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const scored: Array<{ item: EmojiItem; score: number }> = [];

  outer: for (const item of items) {
    let score = 0;
    for (const token of tokens) {
      if (item.name.startsWith(token)) {
        score += 3;
      } else if (item.name.includes(token)) {
        score += 2;
      } else if (item.keywords.includes(token)) {
        score += 1;
      } else {
        continue outer;
      }
    }
    scored.push({ item, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.item);
}
