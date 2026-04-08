import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'church-finder-recently-viewed';
const MAX_ITEMS = 8;

export interface RecentChurch {
  id: string;
  slug: string;
  name: string;
  denomination: string | null;
  avgRating: number;
  coverImageUrl: string | null;
}

function loadRecent(): RecentChurch[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as RecentChurch[]) : [];
  } catch {
    return [];
  }
}

function saveRecent(items: RecentChurch[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage may be full or unavailable
  }
}

export function useRecentlyViewed() {
  const [recent, setRecent] = useState<RecentChurch[]>(loadRecent);

  useEffect(() => {
    saveRecent(recent);
  }, [recent]);

  const addRecent = useCallback((church: RecentChurch) => {
    setRecent((prev) => {
      const filtered = prev.filter((c) => c.id !== church.id);
      return [church, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  return { recent, addRecent };
}
