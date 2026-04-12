import {
  Accessibility,
  Baby,
  BadgeCheck,
  ImageIcon,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react';
import { useState, type ComponentType, type SVGProps } from 'react';

import { DAY_OPTIONS, DISTANCE_OPTIONS, MIN_RATING_OPTIONS, TIME_OPTIONS } from '@/constants';
import { useFilterOptions } from '@/hooks/useChurches';
import { countActiveFilters } from '@/lib/search-state';
import { SearchFilters, useSearchStore } from '@/stores/search-store';
import type { IDenominationOption } from '@/types/church';

// How many denomination chips render by default when the full list is
// long. Above this threshold a "Show all (N more)" disclosure pins the
// most common traditions and hides the long tail until the user asks.
const DENOMINATION_PINNED_COUNT = 6;
// Threshold below which the disclosure is suppressed entirely — a list
// of 7 or 8 chips fits comfortably and a "Show all (1 more)" button
// feels like noise.
const DENOMINATION_DISCLOSURE_THRESHOLD = 8;

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

type BooleanFilterKey =
  | 'wheelchairAccessible'
  | 'goodForChildren'
  | 'goodForGroups'
  | 'hasPhotos'
  | 'isClaimed';

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

interface AmenityFilterSectionProps {
  options: FilterOption[];
}

const AmenityFilterSection = ({ options }: AmenityFilterSectionProps) => {
  const selected = useSearchStore((state) => state.filters.amenities) ?? [];
  const toggleAmenity = useSearchStore((state) => state.toggleAmenity);

  if (options.length === 0) return null;

  return (
    <section className="rounded-[24px] border border-border bg-card p-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-foreground">Amenities</h3>
        <p className="text-sm leading-6 text-muted-foreground">
          Pick every detail that matters — churches must offer all of the amenities you select.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((option) => {
          const value = String(option.value);
          const active = selected.includes(value);

          return (
            <FilterOptionButton
              key={`amenities-${value}`}
              active={active}
              label={option.label}
              onClick={() => toggleAmenity(value)}
            />
          );
        })}
      </div>
    </section>
  );
};

interface LanguageFilterSectionProps {
  options: FilterOption[];
}

const LanguageFilterSection = ({ options }: LanguageFilterSectionProps) => {
  const selected = useSearchStore((state) => state.filters.languages) ?? [];
  const toggleLanguage = useSearchStore((state) => state.toggleLanguage);

  if (options.length === 0) return null;

  return (
    <section className="rounded-[24px] border border-border bg-card p-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-foreground">Language</h3>
        <p className="text-sm leading-6 text-muted-foreground">
          Multi-select — a church matches if it offers services in any of the languages you pick.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((option) => {
          const value = String(option.value);
          const active = selected.includes(value);

          return (
            <FilterOptionButton
              key={`languages-${value}`}
              active={active}
              label={option.label}
              onClick={() => toggleLanguage(value)}
            />
          );
        })}
      </div>
    </section>
  );
};

interface DenominationFilterSectionProps {
  options: IDenominationOption[];
}

const DenominationFilterSection = ({ options }: DenominationFilterSectionProps) => {
  const selected = useSearchStore((state) => state.filters.denomination) ?? [];
  const toggleDenomination = useSearchStore((state) => state.toggleDenomination);
  const [expanded, setExpanded] = useState(false);

  if (options.length === 0) return null;

  // The backend already sorts by count desc, but re-sort defensively so the
  // section stays self-consistent even if a future consumer mocks the data
  // out of order (the existing tests do exactly this).
  const sortedOptions = [...options].sort(
    (a, b) => b.count - a.count || a.value.localeCompare(b.value),
  );

  const needsDisclosure = sortedOptions.length > DENOMINATION_DISCLOSURE_THRESHOLD;
  const visibleOptions =
    needsDisclosure && !expanded
      ? sortedOptions.slice(0, DENOMINATION_PINNED_COUNT)
      : sortedOptions;
  const hiddenCount = needsDisclosure ? sortedOptions.length - DENOMINATION_PINNED_COUNT : 0;

  return (
    <section className="rounded-[24px] border border-border bg-card p-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-foreground">Tradition</h3>
        <p className="text-sm leading-6 text-muted-foreground">
          Pick one or more traditions — we will match churches from any of them.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {visibleOptions.map((option) => {
          const active = selected.includes(option.value);
          // Middle-dot separator matches the visual rhythm used in ChurchCard
          // (`rating · distance`). Keeps the design language consistent across
          // the app.
          const label = `${option.value} · ${option.count}`;

          return (
            <FilterOptionButton
              key={`denomination-${option.value}`}
              active={active}
              label={label}
              onClick={() => toggleDenomination(option.value)}
            />
          );
        })}
      </div>

      {needsDisclosure ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-3 text-sm font-semibold text-foreground underline-offset-4 hover:underline"
          aria-expanded={expanded}
        >
          {expanded ? 'Show fewer' : `Show all (${hiddenCount} more)`}
        </button>
      ) : null}
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
  {
    key: 'hasPhotos',
    label: 'Has photos',
    description: 'Only show churches with uploaded photos on their profile.',
    icon: ImageIcon,
  },
  {
    key: 'isClaimed',
    label: 'Verified church',
    description: 'Only show churches claimed by a leader and verified by our team.',
    icon: BadgeCheck,
  },
];

const BooleanFilterSection = () => {
  const filters = useSearchStore((state) => state.filters);
  const setFilter = useSearchStore((state) => state.setFilter);

  return (
    <section className="rounded-[24px] border border-border bg-card p-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-foreground">
          Accessibility, community & trust
        </h3>
        <p className="text-sm leading-6 text-muted-foreground">
          Only show churches confirmed to meet these needs or hold a verified profile.
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

  const activeFilterCount = countActiveFilters(filters);

  const denominationOptions: IDenominationOption[] = filterOptions?.denominations ?? [];

  const languageOptions: FilterOption[] = (filterOptions?.languages ?? []).map((l) => ({
    label: l,
    value: l,
  }));

  const amenityOptions: FilterOption[] = (filterOptions?.amenities ?? []).map((a) => ({
    label: a,
    value: a,
  }));

  const neighborhoodOptions: FilterOption[] = (filterOptions?.neighborhoods ?? []).map((n) => ({
    label: n,
    value: n,
  }));

  const serviceTypeOptions: FilterOption[] = (filterOptions?.serviceTypes ?? []).map((s) => ({
    label: s,
    value: s,
  }));

  return (
    // Use dynamic viewport units on mobile so the sheet doesn't get
    // clipped when the mobile browser URL bar collapses/expands. Fall
    // back to vh in the rare browser that doesn't support dvh.
    <div className="flex max-h-[88vh] max-h-[88dvh] flex-col bg-background">
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
          label="Distance"
          description="How far from your current search center should we look?"
          filterKey="radius"
          options={DISTANCE_OPTIONS}
        />

        <FilterSection
          label="Minimum rating"
          description="Hide lower-rated churches. Uses their effective rating (community reviews, then Google)."
          filterKey="minRating"
          options={MIN_RATING_OPTIONS}
        />

        <DenominationFilterSection options={denominationOptions} />

        <FilterSection
          label="Neighborhood"
          description="Focus on one part of San Antonio — great for narrowing by commute."
          filterKey="neighborhood"
          options={neighborhoodOptions}
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
          label="Service style"
          description="Match a worship style — traditional, contemporary, bilingual, and more."
          filterKey="serviceType"
          options={serviceTypeOptions}
        />

        <LanguageFilterSection options={languageOptions} />

        <AmenityFilterSection options={amenityOptions} />

        <BooleanFilterSection />
      </div>

      <div
        className="border-t border-border bg-card px-6 pt-5 sm:px-8 sm:py-6"
        // On mobile the filter modal pins to the bottom of the viewport as a
        // bottom sheet, so the footer sits directly on top of the iOS home
        // indicator. Reserve safe-area space so the primary CTAs stay tappable.
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount === 0
              ? 'No filters selected'
              : `${activeFilterCount} ${activeFilterCount === 1 ? 'filter' : 'filters'} selected`}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={clearFilters}
              className="min-h-[44px] rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground hover:bg-muted"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
            >
              {resultCount === 1 ? 'Show 1 church' : `Show ${resultCount} churches`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
