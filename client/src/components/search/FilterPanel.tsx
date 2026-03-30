import { SlidersHorizontal, X } from 'lucide-react';

import {
  AMENITY_OPTIONS,
  DAY_OPTIONS,
  DENOMINATION_OPTIONS,
  LANGUAGE_OPTIONS,
  TIME_OPTIONS,
} from '@/constants';
import { SearchFilters, useSearchStore } from '@/stores/search-store';

interface FilterPanelProps {
  onClose?: () => void;
}

interface FilterOption {
  label: string;
  value: string | number;
}

interface FilterSectionProps {
  label: string;
  description: string;
  filterKey: keyof SearchFilters;
  options: FilterOption[];
}

const FilterOptionButton = ({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${
      active
        ? 'border-[#222222] bg-[#222222] text-white'
        : 'border-[#ddd6ca] bg-white text-[#5f5a55] hover:border-[#222222] hover:bg-[#f8f5ef] hover:text-[#222222]'
    }`}
  >
    {label}
  </button>
);

const FilterSection = ({ label, description, filterKey, options }: FilterSectionProps) => {
  const filters = useSearchStore((state) => state.filters);
  const setFilter = useSearchStore((state) => state.setFilter);

  return (
    <section className="rounded-[28px] border border-[#ece4d7] bg-[#fcfaf6] p-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-[#222222]">{label}</h3>
        <p className="text-sm leading-6 text-[#5f5a55]">{description}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = filters[filterKey] === option.value;

          return (
            <FilterOptionButton
              key={`${filterKey}-${option.value}`}
              active={active}
              label={option.label}
              onClick={() => {
                setFilter(filterKey, active ? undefined : option.value);
              }}
            />
          );
        })}
      </div>
    </section>
  );
};

export const FilterPanel = ({ onClose }: FilterPanelProps) => {
  const filters = useSearchStore((state) => state.filters);
  const clearFilters = useSearchStore((state) => state.clearFilters);

  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== '',
  ).length;

  return (
    <div className="flex max-h-[88vh] flex-col bg-white">
      <div className="border-b border-[#ece4d7] px-6 py-5 sm:px-8 sm:py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9a8f80]">
              Advanced filters
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#1d1d1b]">
              Refine the kind of church you want to browse
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#5f5a55]">
              Pick the signal that matters most right now. Every choice updates the map and list
              together.
            </p>
          </div>

          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ddd6ca] text-[#222222] transition-colors hover:bg-[#f8f5ef]"
              aria-label="Close filters"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5 sm:px-8 sm:py-6">
        <FilterSection
          label="Tradition"
          description="Choose a denomination when you want a clearer theological lane."
          filterKey="denomination"
          options={DENOMINATION_OPTIONS.map((option) => ({
            label: option,
            value: option,
          }))}
        />

        <FilterSection
          label="Service day"
          description="Useful when you are planning around a specific day this week."
          filterKey="day"
          options={DAY_OPTIONS}
        />

        <FilterSection
          label="Time of day"
          description="Narrow down morning, afternoon, or evening worship windows."
          filterKey="time"
          options={TIME_OPTIONS}
        />

        <FilterSection
          label="Language"
          description="Surface churches that regularly hold services in a preferred language."
          filterKey="language"
          options={LANGUAGE_OPTIONS.map((option) => ({
            label: option,
            value: option,
          }))}
        />

        <FilterSection
          label="Amenity"
          description="Look for one practical detail that helps this search feel realistic."
          filterKey="amenities"
          options={AMENITY_OPTIONS.map((option) => ({
            label: option,
            value: option,
          }))}
        />
      </div>

      <div className="border-t border-[#ece4d7] px-6 py-5 sm:px-8 sm:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f8f5ef] px-4 py-2 text-sm font-semibold text-[#5f5a55]">
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount === 0
              ? 'No advanced filters selected'
              : `${activeFilterCount} advanced ${activeFilterCount === 1 ? 'filter' : 'filters'} selected`}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-[#ddd6ca] bg-white px-5 py-3 text-sm font-semibold text-[#222222] transition-colors hover:border-[#222222] hover:bg-[#f8f5ef]"
            >
              Reset search
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[#222222] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              Show results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
