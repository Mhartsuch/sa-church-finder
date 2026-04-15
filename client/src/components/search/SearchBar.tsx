import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { SearchSuggestions } from '@/components/search/SearchSuggestions';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { getWhenSummary } from '@/lib/search-state';
import { useSearchStore } from '@/stores/search-store';

interface SearchBarProps {
  variant?: 'hero' | 'compact';
  onSubmit?: () => void;
  onOpenFilters?: () => void;
}

export const SearchBar = ({ variant = 'compact', onSubmit, onOpenFilters }: SearchBarProps) => {
  const query = useSearchStore((state) => state.query);
  const filters = useSearchStore((state) => state.filters);
  const setQuery = useSearchStore((state) => state.setQuery);
  const navigate = useNavigate();
  const { recent, addRecent, removeRecent, clearRecent } = useRecentSearches();
  const [localValue, setLocalValue] = useState(query);
  const [isFocused, setIsFocused] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(query);
  }, [query]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Close the suggestions popover when the user taps/clicks outside the search
  // shell. We use `pointerdown` (instead of the previous `mousedown`) because
  // it fires for both mouse and touch input on all modern browsers, fixing
  // Android devices where `mousedown` was sometimes not dispatched for taps.
  useEffect(() => {
    if (!isFocused) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target as Node)) return;
      setIsFocused(false);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [isFocused]);

  const commitQuery = useCallback(
    (rawValue: string) => {
      const trimmed = rawValue.trim();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setLocalValue(trimmed);
      setQuery(trimmed);
      if (trimmed) {
        addRecent(trimmed);
      }
      setIsFocused(false);
      inputRef.current?.blur();
      onSubmit?.();
    },
    [addRecent, onSubmit, setQuery],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocalValue(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setQuery(value);
    }, 300);
  };

  const handleClear = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setLocalValue('');
    setQuery('');
    inputRef.current?.focus();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    commitQuery(localValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleNavigateToChurch = (slug: string) => {
    setIsFocused(false);
    inputRef.current?.blur();
    navigate(`/churches/${slug}`);
  };

  const whenSummary = getWhenSummary(filters);
  const isHero = variant === 'hero';
  const showSuggestions = isFocused && (recent.length > 0 || localValue.trim().length >= 2);

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className={`reference-search-shell ${isHero ? 'min-h-[76px]' : 'min-h-[72px]'}`}>
          <div className="reference-search-field hidden min-w-[180px] lg:block">
            <span className="reference-search-label">Location</span>
            <div className="reference-search-summary">San Antonio, TX</div>
          </div>

          <div className="reference-search-field min-w-0 flex-[1.2]">
            <label htmlFor={`search-input-${variant}`} className="reference-search-label">
              <span className="lg:hidden">Search San Antonio</span>
              <span className="hidden lg:inline">Search</span>
            </label>
            <div className="mt-1 flex items-center gap-2">
              <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <input
                id={`search-input-${variant}`}
                ref={inputRef}
                type="text"
                value={localValue}
                onChange={handleChange}
                onFocus={() => setIsFocused(true)}
                onKeyDown={handleKeyDown}
                placeholder="Name, denomination, area..."
                className="reference-search-input mt-0 flex-1"
                autoComplete="off"
                role="combobox"
                aria-expanded={showSuggestions}
                aria-controls={`search-suggestions-${variant}`}
                aria-autocomplete="list"
              />
              {localValue ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:h-8 md:w-8"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenFilters}
            className="reference-search-field hidden min-w-[190px] text-left md:block"
            aria-label="Open filters"
          >
            <span className="reference-search-label">When</span>
            <span className="reference-search-summary flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <span>{whenSummary}</span>
            </span>
          </button>

          <button type="submit" className="reference-search-submit" aria-label="Submit search">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>

      {showSuggestions ? (
        <div id={`search-suggestions-${variant}`}>
          <SearchSuggestions
            term={localValue}
            recent={recent}
            onApplyTerm={(term) => commitQuery(term)}
            onNavigateToChurch={handleNavigateToChurch}
            onRemoveRecent={removeRecent}
            onClearRecent={clearRecent}
          />
        </div>
      ) : null}
    </div>
  );
};
