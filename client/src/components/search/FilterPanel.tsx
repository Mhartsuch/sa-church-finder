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
  resultCount?: number;
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
        : 'border-[#dddddd] bg-white text-[#5f5a55] hover:border-[#222222] hover:bg-[#f7f7f7] hover:text-[#222222]'
    }`}
  >
    {label}
  </button>
);

const FilterSection = ({ label, description, filterKey, options }: FilterSectionProps) => {
  const filters = useSearchStore((state) => state.filters);
  const setFilter = useSearchStore((state) => state.setFilter);

  return (
    <section className="rounded-[24px] border border-[#ebebeb] bg-white p-5">
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

export const FilterPanel = ({ onClose, resultCount = 0 }: FilterPanelProps) => {
  const filters = useSearchStore((state) => state.filters);
  const clearFilters = useSearchStore((state) => state.clearFilters);

  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== '',
  ).length;

  return (
    <div className="flex max-h-[88vh] flex-col bg-[#fbfbfb]">
      <div className="border-b border-[#ebebeb] bg-white px-6 py-5 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#222222] transition-colors hover:bg-[#f7f7f7]"
              aria-label="Close filters"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <div className="h-10 w-10" />
          )}

          <h2 className="text-lg font-semibold text-[#1d1d1b]">Filters</h2>

          <div className="h-10 w-10" />
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5 sm:px-8 sm:py-6">
        <FilterSection
          label="Tradition"
          description="Choose a denomination to narrow the directory quickly."
          filterKey="denomination"
          options={DENOMINATION_OPTIONS.map((option) => ({
            label: option,
            value: option,
          }))}
        />

        <FilterSection
          label="Service day"
          description="Useful when you are planning around one day in the week."
          filterKey="day"
          options={DAY_OPTIONS}
        />

        <FilterSection
          label="Time of day"
          description="Narrow down morning, afternoon, or evening worship."
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
          description="Look for one practical detail that helps the list feel more realistic."
          filterKey="amenities"
          options={AMENITY_OPTIONS.map((option) => ({
            label: option,
            value: option,
          }))}
        />
      </div>

      <div className="border-t border-[#ebebeb] bg-white px-6 py-5 sm:px-8 sm:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f7f7f7] px-4 py-2 text-sm font-semibold text-[#5f5a55]">
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount === 0
              ? 'No filters selected'
              : `${activeFilterCount} ${activeFilterCount === 1 ? 'filter' : 'filters'} selected`}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-[#dddddd] bg-white px-5 py-3 text-sm font-semibold text-[#222222] transition-colors hover:border-[#222222] hover:bg-[#f7f7f7]"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[#222222] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              {resultCount === 1 ? 'Show 1 church' : `Show ${resultCount} churches`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
