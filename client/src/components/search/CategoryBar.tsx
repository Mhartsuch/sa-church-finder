import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { CATEGORIES } from '@/constants/categories';
import { countActiveFilters } from '@/lib/search-params';
import { cn } from '@/lib/utils';
import { IChurchFilters } from '@/types/church';

interface CategoryBarProps {
  filters: IChurchFilters;
  onChange: (filters: IChurchFilters) => void;
  onOpenFilters: () => void;
}

/** Airbnb-style icon category strip with a "Filters" button. */
export const CategoryBar = ({ filters, onChange, onOpenFilters }: CategoryBarProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const activeCount = countActiveFilters(filters);

  const updateEdges = () => {
    const track = trackRef.current;
    if (!track) return;
    setEdges({
      start: track.scrollLeft <= 4,
      end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 4,
    });
  };

  useEffect(() => {
    updateEdges();
    window.addEventListener('resize', updateEdges);
    return () => window.removeEventListener('resize', updateEdges);
  }, []);

  const scroll = (direction: 1 | -1) =>
    trackRef.current?.scrollBy({ left: direction * 320, behavior: 'smooth' });

  const arrow =
    'absolute top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm hover:scale-105 hover:shadow-md md:flex';

  return (
    <div className="flex items-center gap-6">
      <div className="relative min-w-0 flex-1">
        {!edges.start && (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-16 bg-gradient-to-r from-white" />
            <button
              type="button"
              aria-label="Scroll categories left"
              onClick={() => scroll(-1)}
              className={cn(arrow, 'left-0')}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        )}
        <div
          ref={trackRef}
          onScroll={updateEdges}
          className="no-scrollbar flex gap-8 overflow-x-auto"
          role="toolbar"
          aria-label="Church categories"
        >
          {CATEGORIES.map((category) => {
            const active = category.isActive(filters);
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={active}
                onClick={() => onChange(category.toggle(filters))}
                className={cn(
                  'flex shrink-0 flex-col items-center gap-2 border-b-2 pb-3 pt-4 text-xs font-semibold transition',
                  active
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900',
                )}
              >
                <Icon className="h-6 w-6" strokeWidth={1.5} />
                <span className="whitespace-nowrap">{category.label}</span>
              </button>
            );
          })}
        </div>
        {!edges.end && (
          <>
            <div className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-16 bg-gradient-to-l from-white" />
            <button
              type="button"
              aria-label="Scroll categories right"
              onClick={() => scroll(1)}
              className={cn(arrow, 'right-0')}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={onOpenFilters}
        className={cn(
          'flex shrink-0 items-center gap-2 rounded-xl border px-4 py-3.5 text-xs font-semibold transition hover:shadow-md',
          activeCount ? 'border-2 border-gray-900 bg-gray-50' : 'border-gray-300',
        )}
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span className="hidden sm:inline">Filters</span>
        {activeCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[10px] text-white">
            {activeCount}
          </span>
        )}
      </button>
    </div>
  );
};
