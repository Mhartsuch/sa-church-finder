import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'church-finder-recent-searches';
const MAX_ITEMS = 6;

// Custom event name used to synchronize multiple hook instances within the
// same browsing context. The native `storage` event only fires across tabs,
// so we need our own mechanism so that e.g. SearchBar saving a term is
// immediately reflected in SearchPage's recent-searches list.
const SYNC_EVENT = 'recent-searches-changed';

function loadRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === 'string').slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

function saveRecent(items: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    // Notify other hook instances on this page that the data changed.
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  } catch {
    // localStorage may be full, unavailable, or restricted — silently ignore.
  }
}

export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>(loadRecent);

  useEffect(() => {
    saveRecent(recent);
  }, [recent]);

  // Re-read from localStorage whenever another hook instance on the same page
  // writes new data, or when a different tab updates localStorage (the native
  // `storage` event covers the cross-tab case).
  useEffect(() => {
    const resync = () => setRecent(loadRecent());

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) resync();
    };

    window.addEventListener(SYNC_EVENT, resync);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(SYNC_EVENT, resync);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const addRecent = useCallback((rawTerm: string) => {
    const term = rawTerm.trim();
    if (!term) return;

    setRecent((prev) => {
      // De-dupe case-insensitively so "Catholic" and "catholic" collapse.
      const normalized = term.toLowerCase();
      const filtered = prev.filter((existing) => existing.toLowerCase() !== normalized);
      return [term, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  const removeRecent = useCallback((rawTerm: string) => {
    const normalized = rawTerm.trim().toLowerCase();
    if (!normalized) return;

    setRecent((prev) => prev.filter((existing) => existing.toLowerCase() !== normalized));
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
  }, []);

  return { recent, addRecent, removeRecent, clearRecent };
}
