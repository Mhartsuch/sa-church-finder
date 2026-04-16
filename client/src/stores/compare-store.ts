import { create } from 'zustand';

import { IChurchSummary } from '@/types/church';

export const COMPARE_STORAGE_KEY = 'church-finder-compare';
export const MAX_COMPARE = 4;

interface CompareStore {
  selectedChurches: IChurchSummary[];
  addChurch: (church: IChurchSummary) => void;
  removeChurch: (churchId: string) => void;
  toggleChurch: (church: IChurchSummary) => void;
  clearChurches: () => void;
}

const isStoredChurchSummary = (value: unknown): value is IChurchSummary => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const church = value as Partial<IChurchSummary>;

  return (
    typeof church.id === 'string' &&
    typeof church.name === 'string' &&
    typeof church.slug === 'string'
  );
};

const dedupeChurches = (churches: IChurchSummary[]) => {
  const seenChurchIds = new Set<string>();

  return churches.filter((church) => {
    if (seenChurchIds.has(church.id)) {
      return false;
    }

    seenChurchIds.add(church.id);
    return true;
  });
};

const loadStoredChurches = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(COMPARE_STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return dedupeChurches(parsedValue.filter(isStoredChurchSummary));
  } catch {
    return [];
  }
};

const persistChurches = (churches: IChurchSummary[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(churches));
};

export const useCompareStore = create<CompareStore>((set) => ({
  selectedChurches: loadStoredChurches(),

  addChurch: (church) =>
    set((state) => {
      if (state.selectedChurches.length >= MAX_COMPARE) return state;
      const selectedChurches = state.selectedChurches.some(
        (selectedChurch) => selectedChurch.id === church.id,
      )
        ? state.selectedChurches
        : dedupeChurches([...state.selectedChurches, church]);

      persistChurches(selectedChurches);
      return { selectedChurches };
    }),

  removeChurch: (churchId) =>
    set((state) => {
      const selectedChurches = state.selectedChurches.filter((church) => church.id !== churchId);

      persistChurches(selectedChurches);
      return { selectedChurches };
    }),

  toggleChurch: (church) =>
    set((state) => {
      const alreadySelected = state.selectedChurches.some(
        (selectedChurch) => selectedChurch.id === church.id,
      );
      const selectedChurches = alreadySelected
        ? state.selectedChurches.filter((selectedChurch) => selectedChurch.id !== church.id)
        : state.selectedChurches.length >= MAX_COMPARE
          ? state.selectedChurches
          : dedupeChurches([...state.selectedChurches, church]);

      persistChurches(selectedChurches);
      return { selectedChurches };
    }),

  clearChurches: () =>
    set(() => {
      persistChurches([]);
      return { selectedChurches: [] };
    }),
}));
