import { Search } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { DAY_NAMES } from '@/lib/format';
import { filtersToParams, parseFilters } from '@/lib/search-params';
import { cn } from '@/lib/utils';
import { TimeOfDay } from '@/types/church';

const TIMES: { value: TimeOfDay; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
];

/**
 * The compact "Anywhere · Any week · Add guests" pill, reimagined as
 * "Any church · Any day · Any time". Expands into a small search panel.
 */
export const SearchPill = () => {
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const current = parseFilters(pathname === '/' ? searchParams : new URLSearchParams());

  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(current.q ?? '');
  const [day, setDay] = useState<number | undefined>(current.day);
  const [time, setTime] = useState<TimeOfDay | undefined>(current.time);
  const ref = useRef<HTMLDivElement>(null);

  // Reset the draft to the applied filters each time the panel opens.
  const openPanel = () => {
    setQ(current.q ?? '');
    setDay(current.day);
    setTime(current.time);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const params = filtersToParams({ ...current, q: q.trim() || undefined, day, time });
    const view = pathname === '/' ? searchParams.get('view') : null;
    if (view) params.set('view', view);
    setOpen(false);
    navigate({ pathname: '/', search: params.toString() });
  };

  const segment = 'truncate px-4 text-sm';
  const chip = (active: boolean) =>
    cn(
      'rounded-full border px-4 py-2 text-sm transition',
      active ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 hover:border-gray-900',
    );

  return (
    <div ref={ref} className="relative min-w-0 flex-1 md:flex-none">
      <button
        type="button"
        onClick={openPanel}
        className="flex w-full min-w-0 items-center rounded-full border border-gray-300 py-2 pl-2 pr-2 shadow-sm transition-shadow hover:shadow-md md:w-auto"
      >
        <span className={cn(segment, 'font-semibold')}>{current.q || 'Any church'}</span>
        <span className="hidden h-6 w-px bg-gray-300 sm:block" />
        <span className={cn(segment, 'hidden font-semibold sm:block')}>
          {current.day !== undefined ? DAY_NAMES[current.day] : 'Any day'}
        </span>
        <span className="hidden h-6 w-px bg-gray-300 sm:block" />
        <span className={cn(segment, 'hidden text-gray-500 sm:block')}>
          {current.time ? TIMES.find((t) => t.value === current.time)?.label : 'Any time'}
        </span>
        <span className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-white">
          <Search className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      </button>

      {open && (
        <form
          onSubmit={submit}
          className="fixed inset-x-4 top-20 z-50 rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl animate-rise md:absolute md:inset-x-auto md:left-1/2 md:top-14 md:w-[560px] md:-translate-x-1/2"
        >
          <label className="block text-xs font-bold uppercase tracking-wide">
            Where to worship
          </label>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Church name, ministry, or keyword"
            className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
          />
          <p className="mt-5 text-xs font-bold uppercase tracking-wide">Service day</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className={chip(day === undefined)}
              onClick={() => setDay(undefined)}
            >
              Any day
            </button>
            {DAY_NAMES.map((name, i) => (
              <button
                key={name}
                type="button"
                className={chip(day === i)}
                onClick={() => setDay(i)}
              >
                {name.slice(0, 3)}
              </button>
            ))}
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-wide">Time of day</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className={chip(time === undefined)}
              onClick={() => setTime(undefined)}
            >
              Any time
            </button>
            {TIMES.map((t) => (
              <button
                key={t.value}
                type="button"
                className={chip(time === t.value)}
                onClick={() => setTime(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient py-3.5 font-semibold text-white"
          >
            <Search className="h-4 w-4" strokeWidth={3} /> Search
          </button>
        </form>
      )}
    </div>
  );
};
