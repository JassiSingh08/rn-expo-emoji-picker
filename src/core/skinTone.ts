import type { EmojiItem, SkinTone } from './types';

export const SKIN_TONES: SkinTone[] = [
  'default',
  'light',
  'medium_light',
  'medium',
  'medium_dark',
  'dark',
];

const TONE_CHAR: Record<Exclude<SkinTone, 'default'>, string> = {
  light: '\u{1F3FB}',
  medium_light: '\u{1F3FC}',
  medium: '\u{1F3FD}',
  medium_dark: '\u{1F3FE}',
  dark: '\u{1F3FF}',
};

const SLOT = '{t}';

export function applyToneToTemplate(template: string, tone: SkinTone): string {
  const parts = template.split(SLOT);
  if (tone === 'default') return parts.join('');
  return parts.join(TONE_CHAR[tone]);
}

/** The glyph to display/insert for an emoji at a given tone. */
export function displayEmoji(item: EmojiItem, tone: SkinTone): string {
  if (tone === 'default' || !item.toneTemplate) return item.emoji;
  return applyToneToTemplate(item.toneTemplate, tone);
}

/** "1F44B-1F3FD" style code point string for a glyph. */
export function toUnicodeString(glyph: string): string {
  return Array.from(glyph)
    .map((c) => c.codePointAt(0)!.toString(16).toUpperCase())
    .join('-');
}
