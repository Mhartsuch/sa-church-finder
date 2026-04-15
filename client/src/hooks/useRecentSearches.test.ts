import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useRecentSearches } from './useRecentSearches';

const STORAGE_KEY = 'church-finder-recent-searches';

describe('useRecentSearches', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts empty when there is nothing persisted', () => {
    const { result } = renderHook(() => useRecentSearches());

    expect(result.current.recent).toEqual([]);
  });

  it('persists a trimmed search term and exposes it on next render', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addRecent('  Catholic  ');
    });

    expect(result.current.recent).toEqual(['Catholic']);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual(['Catholic']);
  });

  it('ignores empty strings', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addRecent('   ');
    });

    expect(result.current.recent).toEqual([]);
  });

  it('deduplicates case-insensitively and promotes the latest entry', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addRecent('Catholic');
      result.current.addRecent('Baptist');
      result.current.addRecent('catholic');
    });

    expect(result.current.recent).toEqual(['catholic', 'Baptist']);
  });

  it('caps the list at six entries (oldest drops off)', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      ['one', 'two', 'three', 'four', 'five', 'six', 'seven'].forEach((term) => {
        result.current.addRecent(term);
      });
    });

    expect(result.current.recent).toHaveLength(6);
    expect(result.current.recent[0]).toBe('seven');
    expect(result.current.recent).not.toContain('one');
  });

  it('can remove a specific entry', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addRecent('Catholic');
      result.current.addRecent('Baptist');
    });

    act(() => {
      result.current.removeRecent('Catholic');
    });

    expect(result.current.recent).toEqual(['Baptist']);
  });

  it('clears everything and wipes localStorage', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addRecent('Catholic');
      result.current.addRecent('Baptist');
    });

    act(() => {
      result.current.clearRecent();
    });

    expect(result.current.recent).toEqual([]);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([]);
  });

  it('loads existing entries from localStorage on mount', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(['Historic mission']));

    const { result } = renderHook(() => useRecentSearches());

    expect(result.current.recent).toEqual(['Historic mission']);
  });

  it('recovers gracefully from malformed localStorage data', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not-json');

    const { result } = renderHook(() => useRecentSearches());

    expect(result.current.recent).toEqual([]);
  });
});
