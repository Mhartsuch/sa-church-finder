import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'church-finder-recent-searches';
const MAX_ITEMS = 6;

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
  } catch {
    // localStorage may be full, unavailable, or restricted — silently ignore.
  }
}

export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>(loadRecent);

  useEffect(() => {
    saveRecent(recent);
  }, [recent]);

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
