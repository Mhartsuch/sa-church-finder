import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Accessibility, Baby, Star, Users } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

import { fetchChurches } from '@/api/churches';
import { Modal } from '@/components/ui/Modal';
import { useFilterOptions } from '@/hooks/useChurches';
import { churchCount, DAY_NAMES, familyLabel } from '@/lib/format';
import { EMPTY_FILTERS } from '@/lib/search-params';
import { cn } from '@/lib/utils';
import { IChurchFilters, SortOption, TimeOfDay } from '@/types/church';

interface FiltersModalProps {
  open: boolean;
  filters: IChurchFilters;
  onClose: () => void;
  onApply: (filters: IChurchFilters) => void;
}

const SORTS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Recommended' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'distance', label: 'Closest to downtown' },
  { value: 'name', label: 'A–Z' },
];

const TIMES: { value: TimeOfDay; label: string; hint: string }[] = [
  { value: 'morning', label: 'Morning', hint: 'Before noon' },
  { value: 'afternoon', label: 'Afternoon', hint: '12–5 PM' },
  { value: 'evening', label: 'Evening', hint: 'After 5 PM' },
];

const toggleIn = (list: string[], value: string) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

export const FiltersModal = ({ open, filters, onClose, onApply }: FiltersModalProps) => {
  const [draft, setDraft] = useState(filters);
  const [showAllDenominations, setShowAllDenominations] = useState(false);
  const { data: options } = useFilterOptions();

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const { data: preview } = useQuery({
    queryKey: ['churches', 'count', draft],
    queryFn: () => fetchChurches({ ...draft, page: 1, pageSize: 1 }),
    enabled: open,
    placeholderData: keepPreviousData,
  });

  const set = (patch: Partial<IChurchFilters>) => setDraft((current) => ({ ...current, ...patch }));
  const denominations = options?.denominations ?? [];
  const visibleDenominations = showAllDenominations ? denominations : denominations.slice(0, 10);
  const total = preview?.meta.total;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Filters"
      size="lg"
      footer={
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="rounded-lg px-2 py-2 font-semibold underline hover:bg-gray-100"
            onClick={() => setDraft({ ...EMPTY_FILTERS, q: draft.q })}
          >
            Clear all
          </button>
          <button
            type="button"
            className="rounded-lg bg-gray-900 px-6 py-3.5 font-semibold text-white hover:bg-black"
            onClick={() => onApply(draft)}
          >
            {total === undefined ? 'Show churches' : `Show ${churchCount(total)}`}
          </button>
        </div>
      }
    >
      <div className="divide-y divide-gray-200 px-6">
        <Section title="Sort by">
          <div className="flex flex-wrap gap-3">
            {SORTS.map((sort) => (
              <Chip
                key={sort.value}
                active={draft.sort === sort.value}
                onClick={() => set({ sort: sort.value })}
              >
                {sort.label}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title="Denomination" subtitle="Choose as many as you like.">
          <div className="flex flex-wrap gap-3">
            {visibleDenominations.map((option) => (
              <Chip
                key={option.value}
                active={draft.denominations.includes(option.value)}
                onClick={() => set({ denominations: toggleIn(draft.denominations, option.value) })}
              >
                {familyLabel(option.value)} <span className="text-gray-400">· {option.count}</span>
              </Chip>
            ))}
          </div>
          {denominations.length > 10 && (
            <button
              type="button"
              className="mt-4 font-semibold underline"
              onClick={() => setShowAllDenominations((value) => !value)}
            >
              {showAllDenominations ? 'Show less' : `Show all ${denominations.length}`}
            </button>
          )}
        </Section>

        <Section title="Service day">
          <div className="flex flex-wrap gap-3">
            <Chip active={draft.day === undefined} onClick={() => set({ day: undefined })}>
              Any day
            </Chip>
            {DAY_NAMES.map((name, i) => (
              <Chip key={name} active={draft.day === i} onClick={() => set({ day: i })}>
                {name}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title="Service time">
          <div className="grid grid-cols-3 gap-3">
            {TIMES.map((time) => (
              <button
                key={time.value}
                type="button"
                aria-pressed={draft.time === time.value}
                onClick={() => set({ time: draft.time === time.value ? undefined : time.value })}
                className={cn(
                  'rounded-xl border p-4 text-left transition',
                  draft.time === time.value
                    ? 'border-2 border-gray-900 bg-gray-50'
                    : 'border-gray-300 hover:border-gray-900',
                )}
              >
                <span className="block font-semibold">{time.label}</span>
                <span className="text-sm text-gray-500">{time.hint}</span>
              </button>
            ))}
          </div>
        </Section>

        {options && options.languages.length > 1 && (
          <Section title="Service language">
            <div className="flex flex-wrap gap-3">
              {options.languages.map((language) => (
                <Chip
                  key={language}
                  active={draft.languages.includes(language)}
                  onClick={() => set({ languages: toggleIn(draft.languages, language) })}
                >
                  {language}
                </Chip>
              ))}
            </div>
          </Section>
        )}

        <Section title="Good to know">
          <div className="grid gap-3 sm:grid-cols-3">
            <Feature
              icon={<Baby className="h-6 w-6" strokeWidth={1.5} />}
              label="Great for kids"
              active={draft.goodForChildren}
              onClick={() => set({ goodForChildren: !draft.goodForChildren })}
            />
            <Feature
              icon={<Accessibility className="h-6 w-6" strokeWidth={1.5} />}
              label="Wheelchair accessible"
              active={draft.wheelchairAccessible}
              onClick={() => set({ wheelchairAccessible: !draft.wheelchairAccessible })}
            />
            <Feature
              icon={<Users className="h-6 w-6" strokeWidth={1.5} />}
              label="Good for groups"
              active={draft.goodForGroups}
              onClick={() => set({ goodForGroups: !draft.goodForGroups })}
            />
          </div>
        </Section>

        <Section title="Rating">
          <div className="flex flex-wrap gap-3">
            <Chip active={!draft.minRating} onClick={() => set({ minRating: undefined })}>
              Any
            </Chip>
            {[3, 4, 5].map((rating) => (
              <Chip
                key={rating}
                active={draft.minRating === rating}
                onClick={() => set({ minRating: rating })}
              >
                <Star className="mr-1 inline h-3.5 w-3.5 fill-current" />
                {rating === 5 ? '5' : `${rating}+`}
              </Chip>
            ))}
          </div>
        </Section>

        {options && options.neighborhoods.length > 0 && (
          <Section title="Neighborhood">
            <select
              value={draft.neighborhood ?? ''}
              onChange={(e) => set({ neighborhood: e.target.value || undefined })}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              aria-label="Neighborhood"
            >
              <option value="">All of San Antonio</option>
              {options.neighborhoods.map((neighborhood) => (
                <option key={neighborhood} value={neighborhood}>
                  {neighborhood}
                </option>
              ))}
            </select>
          </Section>
        )}
      </div>
    </Modal>
  );
};

const Section = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) => (
  <section className="py-8">
    <h3 className="text-[22px] font-semibold">{title}</h3>
    {subtitle && <p className="mt-1 text-gray-500">{subtitle}</p>}
    <div className="mt-5">{children}</div>
  </section>
);

const Chip = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={cn(
      'rounded-full border px-5 py-2.5 text-sm transition',
      active ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 hover:border-gray-900',
    )}
  >
    {children}
  </button>
);

const Feature = ({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={cn(
      'flex flex-col gap-6 rounded-xl border p-4 text-left transition',
      active ? 'border-2 border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-900',
    )}
  >
    {icon}
    <span className="font-semibold">{label}</span>
  </button>
);
