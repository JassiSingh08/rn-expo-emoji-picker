import { useCallback, useEffect, useRef, useState } from 'react';
import { getEmojiBySlug } from './data';
import type { EmojiItem, EmojiPickerStorage } from './types';

interface RecentEntry {
  slug: string;
  count: number;
  lastUsed: number;
}

const MAX_STORED = 60;

function rank(entries: RecentEntry[]): RecentEntry[] {
  return [...entries].sort(
    (a, b) => b.count - a.count || b.lastUsed - a.lastUsed
  );
}

export function useRecents(
  storage: EmojiPickerStorage,
  storageKey: string,
  enabled: boolean,
  limit: number
): { recentItems: EmojiItem[]; addRecent: (item: EmojiItem) => void } {
  const [entries, setEntries] = useState<RecentEntry[]>([]);
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    Promise.resolve(storage.getItem(storageKey))
      .then((raw) => {
        if (cancelled || !raw) return;
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setEntries(
            parsed.filter(
              (e): e is RecentEntry =>
                typeof e?.slug === 'string' && typeof e?.count === 'number'
            )
          );
        }
      })
      .catch(() => {
        // Unreadable/corrupt recents are not worth crashing the picker over.
      });
    return () => {
      cancelled = true;
    };
  }, [storage, storageKey, enabled]);

  const addRecent = useCallback(
    (item: EmojiItem) => {
      if (!enabled) return;
      const prev = entriesRef.current;
      const existing = prev.find((e) => e.slug === item.slug);
      const next = existing
        ? prev.map((e) =>
            e.slug === item.slug
              ? { ...e, count: e.count + 1, lastUsed: Date.now() }
              : e
          )
        : [...prev, { slug: item.slug, count: 1, lastUsed: Date.now() }];
      const trimmed = rank(next).slice(0, MAX_STORED);
      setEntries(trimmed);
      Promise.resolve(storage.setItem(storageKey, JSON.stringify(trimmed))).catch(
        () => {}
      );
    },
    [storage, storageKey, enabled]
  );

  const recentItems = enabled
    ? rank(entries)
        .slice(0, limit)
        .map((e) => getEmojiBySlug(e.slug))
        .filter((i): i is EmojiItem => i != null)
    : [];

  return { recentItems, addRecent };
}
