import { useEffect, useRef, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

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
  const [localValue, setLocalValue] = useState(query);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    setLocalValue('');
    setQuery('');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setQuery(localValue);
    onSubmit?.();
  };

  const whenSummary = getWhenSummary(filters);
  const isHero = variant === 'hero';

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className={`reference-search-shell ${isHero ? 'min-h-[76px]' : 'min-h-[72px]'}`}>
        <div className="reference-search-field hidden min-w-[180px] lg:block">
          <span className="reference-search-label">Location</span>
          <div className="reference-search-summary">San Antonio, TX</div>
        </div>

        <div className="reference-search-field min-w-0 flex-[1.2]">
          <label htmlFor={`search-input-${variant}`} className="reference-search-label">
            Search
          </label>
          <div className="mt-1 flex items-center gap-2">
            <Search className="h-4 w-4 flex-shrink-0 text-[#6b6560]" />
            <input
              id={`search-input-${variant}`}
              type="text"
              value={localValue}
              onChange={handleChange}
              placeholder="Name, denomination, area..."
              className="reference-search-input mt-0 flex-1"
            />
            {localValue ? (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#9a9590] transition-colors hover:bg-[#f3f3f3] hover:text-[#1a1a1a]"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
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
            <SlidersHorizontal className="h-4 w-4 text-[#6b6560]" />
            <span>{whenSummary}</span>
          </span>
        </button>

        <button type="submit" className="reference-search-submit" aria-label="Submit search">
          <Search className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
};
