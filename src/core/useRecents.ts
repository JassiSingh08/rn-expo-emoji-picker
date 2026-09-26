import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getEmojiBySlug } from './data';
import type { EmojiItem, EmojiPickerStorage } from './types';

interface RecentEntry {
  slug: string;
  count: number;
  lastUsed: number;
}

// Entries are tagged with the storage + key they were read from, so another
// account never sees them — not even for the render between a key change
// and the effect that reloads.
interface RecentsState {
  storage: EmojiPickerStorage;
  key: string;
  entries: RecentEntry[];
  hydrated: boolean;
}

const MAX_STORED = 60;
const NO_ENTRIES: RecentEntry[] = [];

function rank(entries: RecentEntry[]): RecentEntry[] {
  return [...entries].sort(
    (a, b) => b.count - a.count || b.lastUsed - a.lastUsed
  );
}

function parse(raw: string | null | undefined): RecentEntry[] {
  if (!raw) return NO_ENTRIES;
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) return NO_ENTRIES;
  return parsed.filter(
    (e): e is RecentEntry =>
      typeof e?.slug === 'string' && typeof e?.count === 'number'
  );
}

function merge(stored: RecentEntry[], picked: RecentEntry[]): RecentEntry[] {
  const bySlug = new Map(stored.map((e) => [e.slug, e]));
  for (const p of picked) {
    const s = bySlug.get(p.slug);
    bySlug.set(
      p.slug,
      s
        ? { slug: p.slug, count: s.count + p.count, lastUsed: Math.max(s.lastUsed, p.lastUsed) }
        : p
    );
  }
  return rank([...bySlug.values()]).slice(0, MAX_STORED);
}

function persist(storage: EmojiPickerStorage, key: string, entries: RecentEntry[]) {
  Promise.resolve(storage.setItem(key, JSON.stringify(entries))).catch(() => {});
}

export function useRecents(
  storage: EmojiPickerStorage,
  storageKey: string,
  enabled: boolean,
  limit: number
): { recentItems: EmojiItem[]; addRecent: (item: EmojiItem) => void } {
  const [state, setState] = useState<RecentsState>(() => ({
    storage,
    key: storageKey,
    entries: NO_ENTRIES,
    hydrated: false,
  }));
  const stateRef = useRef(state);
  stateRef.current = state;

  const commit = useCallback((next: RecentsState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const s = stateRef.current;
    if (s.storage !== storage || s.key !== storageKey || s.hydrated) {
      commit({ storage, key: storageKey, entries: NO_ENTRIES, hydrated: false });
    }
    Promise.resolve(storage.getItem(storageKey))
      .then(parse)
      // Unreadable/corrupt recents are not worth crashing the picker over.
      .catch(() => NO_ENTRIES)
      .then((stored) => {
        if (cancelled) return;
        // Picks made before storage answered get merged in; writing them
        // straight away would have replaced the saved history.
        const picked = stateRef.current.entries;
        const entries = picked.length ? merge(stored, picked) : stored;
        commit({ storage, key: storageKey, entries, hydrated: true });
        if (picked.length) persist(storage, storageKey, entries);
      });
    return () => {
      cancelled = true;
    };
  }, [storage, storageKey, enabled, commit]);

  const addRecent = useCallback(
    (item: EmojiItem) => {
      if (!enabled) return;
      const s = stateRef.current;
      if (s.storage !== storage || s.key !== storageKey) return;
      const existing = s.entries.find((e) => e.slug === item.slug);
      const next = existing
        ? s.entries.map((e) =>
            e.slug === item.slug
              ? { ...e, count: e.count + 1, lastUsed: Date.now() }
              : e
          )
        : [...s.entries, { slug: item.slug, count: 1, lastUsed: Date.now() }];
      const entries = rank(next).slice(0, MAX_STORED);
      commit({ ...s, entries });
      if (s.hydrated) persist(storage, storageKey, entries);
    },
    [storage, storageKey, enabled, commit]
  );

  const entries =
    enabled && state.storage === storage && state.key === storageKey
      ? state.entries
      : NO_ENTRIES;
  const recentItems = useMemo(
    () =>
      rank(entries)
        .slice(0, limit)
        .map((e) => getEmojiBySlug(e.slug))
        .filter((i): i is EmojiItem => i != null),
    [entries, limit]
  );

  return { recentItems, addRecent };
}
