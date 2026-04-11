import { Accessibility, Baby, SlidersHorizontal, Users, X } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

import { DAY_OPTIONS, TIME_OPTIONS } from '@/constants';
import { useFilterOptions } from '@/hooks/useChurches';
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

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type BooleanFilterKey = 'wheelchairAccessible' | 'goodForChildren' | 'goodForGroups';

interface BooleanFilterOption {
  key: BooleanFilterKey;
  label: string;
  description: string;
  icon: IconComponent;
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
        ? 'border-foreground bg-foreground text-white'
        : 'border-border bg-card text-muted-foreground hover:border-foreground hover:bg-muted hover:text-foreground'
    }`}
  >
    {label}
  </button>
);

const FilterSection = ({ label, description, filterKey, options }: FilterSectionProps) => {
  const filters = useSearchStore((state) => state.filters);
  const setFilter = useSearchStore((state) => state.setFilter);

  if (options.length === 0) return null;

  return (
    <section className="rounded-[24px] border border-border bg-card p-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-foreground">{label}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
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

const BOOLEAN_FILTER_OPTIONS: BooleanFilterOption[] = [
  {
    key: 'wheelchairAccessible',
    label: 'Wheelchair accessible',
    description: 'Step-free entry and accessible seating confirmed.',
    icon: Accessibility,
  },
  {
    key: 'goodForChildren',
    label: 'Family friendly',
    description: 'Welcoming for kids — nursery, kid-friendly spaces, or programming.',
    icon: Baby,
  },
  {
    key: 'goodForGroups',
    label: 'Good for groups',
    description: 'Room for small groups, visitors, or larger parties.',
    icon: Users,
  },
];

const BooleanFilterSection = () => {
  const filters = useSearchStore((state) => state.filters);
  const setFilter = useSearchStore((state) => state.setFilter);

  return (
    <section className="rounded-[24px] border border-border bg-card p-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-foreground">Accessibility & community</h3>
        <p className="text-sm leading-6 text-muted-foreground">
          Only show churches confirmed to meet these needs.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {BOOLEAN_FILTER_OPTIONS.map(({ key, label, description, icon: Icon }) => {
          const active = filters[key] === true;

          return (
            <button
              key={key}
              type="button"
              role="switch"
              aria-checked={active}
              aria-label={label}
              onClick={() => setFilter(key, active ? undefined : true)}
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                active
                  ? 'border-foreground bg-foreground/5'
                  : 'border-border bg-card hover:border-foreground hover:bg-muted'
              }`}
            >
              <span
                className={`mt-0.5 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
                  active ? 'bg-foreground text-white' : 'bg-muted text-muted-foreground'
                }`}
                aria-hidden="true"
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="text-sm font-semibold text-foreground">{label}</span>
                <span className="text-xs leading-5 text-muted-foreground">{description}</span>
              </span>
              <span
                className={`mt-1 inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full p-0.5 transition-colors ${
                  active ? 'bg-foreground' : 'bg-muted'
                }`}
                aria-hidden="true"
              >
                <span
                  className={`block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    active ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export const FilterPanel = ({ onClose, resultCount = 0 }: FilterPanelProps) => {
  const filters = useSearchStore((state) => state.filters);
  const clearFilters = useSearchStore((state) => state.clearFilters);
  const { data: filterOptions } = useFilterOptions();

  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== '' && value !== false,
  ).length;

  const denominationOptions: FilterOption[] = (filterOptions?.denominations ?? []).map((d) => ({
    label: d,
    value: d,
  }));

  const languageOptions: FilterOption[] = (filterOptions?.languages ?? []).map((l) => ({
    label: l,
    value: l,
  }));

  const amenityOptions: FilterOption[] = (filterOptions?.amenities ?? []).map((a) => ({
    label: a,
    value: a,
  }));

  return (
    <div className="flex max-h-[88vh] flex-col bg-background">
      <div className="border-b border-border bg-card px-6 py-5 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
              aria-label="Close filters"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <div className="h-10 w-10" />
          )}

          <h2 className="text-lg font-semibold text-foreground">Filters</h2>

          <div className="h-10 w-10" />
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5 sm:px-8 sm:py-6">
        <FilterSection
          label="Tradition"
          description="Choose a denomination to narrow the directory quickly."
          filterKey="denomination"
          options={denominationOptions}
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
          options={languageOptions}
        />

        <FilterSection
          label="Amenity"
          description="Look for one practical detail that helps the list feel more realistic."
          filterKey="amenities"
          options={amenityOptions}
        />

        <BooleanFilterSection />
      </div>

      <div className="border-t border-border bg-card px-6 py-5 sm:px-8 sm:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount === 0
              ? 'No filters selected'
              : `${activeFilterCount} ${activeFilterCount === 1 ? 'filter' : 'filters'} selected`}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground hover:bg-muted"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
            >
              {resultCount === 1 ? 'Show 1 church' : `Show ${resultCount} churches`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
