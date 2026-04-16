import { useEffect, useMemo, useState } from 'react';
import {
  Accessibility,
  Baby,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Heart,
  Languages,
  MapPin,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { AddToCalendarButton } from '@/components/events/AddToCalendarButton';
import { SubscribeToCalendarButton } from '@/components/events/SubscribeToCalendarButton';
import { ShareButton } from '@/components/layout/ShareButton';
import { EventListJsonLd } from '@/components/seo/JsonLd';
import { useAuthSession } from '@/hooks/useAuth';
import { useFilterOptions } from '@/hooks/useChurches';
import { useDocumentHead } from '@/hooks/useDocumentHead';
import { useEventsFeed } from '@/hooks/useEvents';
import { buildAggregatedEventsFeedUrl } from '@/lib/calendar-feed-url';
import {
  EVENT_DATE_PRESETS,
  EventDatePresetId,
  matchEventDatePreset,
  resolveEventDatePreset,
} from '@/lib/event-date-presets';
import { groupEventsByLocalDay } from '@/lib/event-grouping';
import {
  ChurchEventType,
  EVENT_SORT_OPTIONS,
  EVENT_TIME_OF_DAY,
  EVENT_TYPES,
  EventSortOption,
  EventTimeOfDay,
  IAggregatedEvent,
  IEventsFeedFilters,
} from '@/types/event';

const PAGE_SIZE = 12;

const EVENT_TYPE_LABELS: Record<ChurchEventType, string> = {
  service: 'Service',
  community: 'Community',
  volunteer: 'Volunteer',
  study: 'Study',
  youth: 'Youth',
  other: 'Other',
};

const EVENT_TYPE_BADGE_COLORS: Record<ChurchEventType, string> = {
  service: 'bg-green-100 text-green-900',
  community: 'bg-blue-100 text-blue-900',
  volunteer: 'bg-amber-100 text-amber-900',
  study: 'bg-purple-100 text-purple-900',
  youth: 'bg-yellow-100 text-yellow-900',
  other: 'bg-gray-100 text-gray-900',
};

const isChurchEventType = (value: string | null): value is ChurchEventType =>
  value !== null && (EVENT_TYPES as readonly string[]).includes(value);

const TIME_OF_DAY_LABELS: Record<EventTimeOfDay, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

const isTimeOfDay = (value: string | null): value is EventTimeOfDay =>
  value !== null && (EVENT_TIME_OF_DAY as readonly string[]).includes(value);

const SORT_LABELS: Record<EventSortOption, string> = {
  soonest: 'Soonest',
  recent: 'Recently announced',
};

const DEFAULT_SORT: EventSortOption = 'soonest';

const isSortOption = (value: string | null): value is EventSortOption =>
  value !== null && (EVENT_SORT_OPTIONS as readonly string[]).includes(value);

const formatEventTimeRange = (startTime: string, endTime?: string | null): string => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const startLabel = formatter.format(new Date(startTime));
  if (!endTime) {
    return startLabel;
  }

  return `${startLabel} – ${formatter.format(new Date(endTime))}`;
};

const toDateInputValue = (iso: string | undefined): string => {
  if (!iso) return '';
  // Input expects YYYY-MM-DD
  return iso.slice(0, 10);
};

const toIsoFromDateInput = (value: string, endOfDay = false): string | undefined => {
  if (!value) return undefined;
  const suffix = endOfDay ? 'T23:59:59.999Z' : 'T00:00:00.000Z';
  return `${value}${suffix}`;
};

type FeedFormState = {
  q: string;
  /**
   * Multi-select event type filter. Order matches the order users selected
   * the chips, which keeps the URL stable across re-renders.
   */
  types: ChurchEventType[];
  fromDate: string;
  toDate: string;
  savedOnly: boolean;
  timeOfDay: EventTimeOfDay | '';
  /**
   * Multi-select neighborhood filter. Selection order is preserved so the
   * serialized URL string stays stable across re-renders (mirroring how
   * `types`, `denominations`, and `languages` are handled elsewhere).
   */
  neighborhoods: string[];
  /**
   * Multi-select denomination-family filter. The selection order is
   * preserved so the serialized URL string stays stable across re-renders
   * (mirroring how `types` is handled above).
   */
  denominations: string[];
  /**
   * When true, limit the feed to events hosted by churches flagged as
   * wheelchair accessible.
   */
  accessibleOnly: boolean;
  /**
   * When true, limit the feed to events hosted by churches flagged as good
   * for children (`church.goodForChildren = true`). Mirrors `accessibleOnly`.
   */
  familyFriendly: boolean;
  /**
   * When true, limit the feed to events hosted by churches flagged as good
   * for groups (`church.goodForGroups = true`). Mirrors `familyFriendly`.
   */
  groupFriendly: boolean;
  /**
   * Multi-select service-language filter. Selection order is preserved so the
   * serialized URL string stays stable across re-renders (mirroring how
   * `types` and `denominations` are handled above).
   */
  languages: string[];
  /**
   * Feed ordering. `soonest` is the historical default (chronological);
   * `recent` reorders the feed by most-recently-announced events.
   */
  sort: EventSortOption;
};

const EMPTY_FORM: FeedFormState = {
  q: '',
  types: [],
  fromDate: '',
  toDate: '',
  savedOnly: false,
  timeOfDay: '',
  neighborhoods: [],
  denominations: [],
  accessibleOnly: false,
  familyFriendly: false,
  groupFriendly: false,
  languages: [],
  sort: DEFAULT_SORT,
};

const parseTypeParam = (raw: string | null): ChurchEventType[] => {
  if (!raw) return [];
  const seen = new Set<ChurchEventType>();
  const ordered: ChurchEventType[] = [];
  for (const token of raw.split(',')) {
    const trimmed = token.trim();
    if (isChurchEventType(trimmed) && !seen.has(trimmed)) {
      seen.add(trimmed);
      ordered.push(trimmed);
    }
  }
  return ordered;
};

/**
 * Parse the comma-separated `denomination` URL param into a deduplicated,
 * order-preserving list of family names. Casing is preserved so chip labels
 * read naturally (e.g. "Baptist" not "baptist") — the server matches
 * case-insensitively against `denominationFamily`.
 */
const parseDenominationParam = (raw: string | null): string[] => {
  if (!raw) return [];
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const token of raw.split(',')) {
    const trimmed = token.trim();
    if (trimmed.length > 0 && !seen.has(trimmed)) {
      seen.add(trimmed);
      ordered.push(trimmed);
    }
  }
  return ordered;
};

/**
 * Parse the comma-separated `language` URL param into a deduplicated,
 * order-preserving list of language names. Mirrors `parseDenominationParam`
 * so the two multi-select filters share the same wire contract.
 */
const parseLanguageParam = (raw: string | null): string[] => {
  if (!raw) return [];
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const token of raw.split(',')) {
    const trimmed = token.trim();
    if (trimmed.length > 0 && !seen.has(trimmed)) {
      seen.add(trimmed);
      ordered.push(trimmed);
    }
  }
  return ordered;
};

/**
 * Parse the comma-separated `neighborhood` URL param into a deduplicated,
 * order-preserving list of neighborhood names. Mirrors
 * `parseDenominationParam` / `parseLanguageParam` so every multi-select
 * chip filter shares the same wire contract.
 */
const parseNeighborhoodParam = (raw: string | null): string[] => {
  if (!raw) return [];
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const token of raw.split(',')) {
    const trimmed = token.trim();
    if (trimmed.length > 0 && !seen.has(trimmed)) {
      seen.add(trimmed);
      ordered.push(trimmed);
    }
  }
  return ordered;
};

const readFormFromParams = (searchParams: URLSearchParams): FeedFormState => {
  const rawTimeOfDay = searchParams.get('timeOfDay');
  const rawSort = searchParams.get('sort');

  return {
    q: searchParams.get('q') ?? '',
    types: parseTypeParam(searchParams.get('type')),
    fromDate: toDateInputValue(searchParams.get('from') ?? undefined),
    toDate: toDateInputValue(searchParams.get('to') ?? undefined),
    savedOnly: searchParams.get('saved') === '1',
    timeOfDay: isTimeOfDay(rawTimeOfDay) ? rawTimeOfDay : '',
    neighborhoods: parseNeighborhoodParam(searchParams.get('neighborhood')),
    denominations: parseDenominationParam(searchParams.get('denomination')),
    accessibleOnly: searchParams.get('accessible') === '1',
    familyFriendly: searchParams.get('family') === '1',
    groupFriendly: searchParams.get('groups') === '1',
    languages: parseLanguageParam(searchParams.get('language')),
    sort: isSortOption(rawSort) ? rawSort : DEFAULT_SORT,
  };
};

const EventCard = ({ event }: { event: IAggregatedEvent }) => {
  const dateObj = new Date(event.startTime);
  const day = dateObj.getDate();
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(dateObj);
  const year = dateObj.getFullYear();

  return (
    <article className="flex overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-[2px] hover:shadow-airbnb">
      <div
        className="flex w-[96px] flex-shrink-0 flex-col items-center justify-center px-2 py-4 text-white"
        style={{ background: 'linear-gradient(to bottom right, #E61E4D, #D70466)' }}
      >
        <div className="text-[32px] font-bold leading-none">{day}</div>
        <div className="mt-1 text-[13px] font-semibold uppercase tracking-wide">{month}</div>
        <div className="text-[11px] font-medium text-white/80">{year}</div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[16px] font-bold leading-tight text-foreground">{event.title}</h3>
          <span
            className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${EVENT_TYPE_BADGE_COLORS[event.eventType]}`}
          >
            {EVENT_TYPE_LABELS[event.eventType]}
          </span>
        </div>

        <Link
          to={`/churches/${event.church.slug}`}
          className="mt-1 inline-flex items-center gap-1 text-[14px] font-semibold text-[#FF385C] hover:underline"
        >
          {event.church.name}
        </Link>

        {event.description ? (
          <p className="mt-2 line-clamp-2 text-[13px] text-muted-foreground">{event.description}</p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5" />
            {formatEventTimeRange(event.startTime, event.endTime)}
          </span>
          {event.locationOverride ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {event.locationOverride}
            </span>
          ) : event.church.city ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {event.church.city}
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <ShareButton
            variant="subtle"
            target={{
              title: `${event.title} — ${event.church.name}`,
              text: event.description
                ? event.description.slice(0, 140)
                : `Upcoming at ${event.church.name}`,
              url:
                typeof window !== 'undefined'
                  ? `${window.location.origin}/churches/${event.church.slug}#events`
                  : `/churches/${event.church.slug}#events`,
            }}
          />
          <AddToCalendarButton
            event={{
              id: event.occurrenceId,
              title: event.title,
              description: event.description,
              startTime: event.startTime,
              endTime: event.endTime,
              location: event.locationOverride ?? event.church.name,
              url:
                typeof window !== 'undefined'
                  ? `${window.location.origin}/churches/${event.church.slug}`
                  : `/churches/${event.church.slug}`,
            }}
          />
        </div>
      </div>
    </article>
  );
};

const EventsDiscoveryPage = () => {
  useDocumentHead({
    title: 'Church Events in San Antonio',
    description:
      'Discover upcoming church events in San Antonio — services, community gatherings, volunteer opportunities, study groups, and youth programs.',
    canonicalPath: '/events',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuthSession();
  const { data: filterOptions } = useFilterOptions();
  const [form, setForm] = useState<FeedFormState>(() => readFormFromParams(searchParams));

  // Keep local form in sync when URL changes (e.g. back/forward navigation).
  useEffect(() => {
    setForm(readFormFromParams(searchParams));
  }, [searchParams]);

  const pageParam = searchParams.get('page');
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;

  const filters: IEventsFeedFilters = useMemo(() => {
    const rawTimeOfDay = searchParams.get('timeOfDay');
    const rawSort = searchParams.get('sort');
    const savedOnly = isAuthenticated && searchParams.get('saved') === '1';
    const types = parseTypeParam(searchParams.get('type'));
    const neighborhoods = parseNeighborhoodParam(searchParams.get('neighborhood'));
    const denominations = parseDenominationParam(searchParams.get('denomination'));
    const accessibleOnly = searchParams.get('accessible') === '1';
    const familyFriendly = searchParams.get('family') === '1';
    const groupFriendly = searchParams.get('groups') === '1';
    const languages = parseLanguageParam(searchParams.get('language'));
    const sort: EventSortOption | undefined = isSortOption(rawSort) ? rawSort : undefined;

    return {
      type: types.length > 0 ? types : undefined,
      q: searchParams.get('q')?.trim() || undefined,
      from: toIsoFromDateInput(searchParams.get('from') ?? '', false),
      to: toIsoFromDateInput(searchParams.get('to') ?? '', true),
      page,
      pageSize: PAGE_SIZE,
      savedOnly: savedOnly || undefined,
      timeOfDay: isTimeOfDay(rawTimeOfDay) ? rawTimeOfDay : undefined,
      neighborhood: neighborhoods.length > 0 ? neighborhoods : undefined,
      denomination: denominations.length > 0 ? denominations : undefined,
      accessibleOnly: accessibleOnly || undefined,
      familyFriendly: familyFriendly || undefined,
      groupFriendly: groupFriendly || undefined,
      language: languages.length > 0 ? languages : undefined,
      // Only forward a non-default sort so the query string (and cached
      // response) stays clean for the most common case.
      sort: sort && sort !== DEFAULT_SORT ? sort : undefined,
    };
  }, [searchParams, page, isAuthenticated]);

  const { data, isLoading, isFetching, error } = useEventsFeed(filters);

  const totalResults = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 0;
  const events = useMemo(() => data?.data ?? [], [data?.data]);
  const eventGroups = useMemo(() => groupEventsByLocalDay(events), [events]);

  const appliedChips = useMemo(() => {
    const chips: Array<{ key: string; label: string }> = [];
    if (filters.type) {
      // Each selected event type gets its own removable chip so users can
      // peel them off one at a time without clearing the whole multi-select.
      for (const type of filters.type) {
        chips.push({ key: `type:${type}`, label: `Type: ${EVENT_TYPE_LABELS[type]}` });
      }
    }
    if (filters.q) {
      chips.push({ key: 'q', label: `Search: "${filters.q}"` });
    }
    if (searchParams.get('from')) {
      chips.push({ key: 'from', label: `From: ${searchParams.get('from')}` });
    }
    if (searchParams.get('to')) {
      chips.push({ key: 'to', label: `To: ${searchParams.get('to')}` });
    }
    if (filters.savedOnly) {
      chips.push({ key: 'saved', label: 'From saved churches' });
    }
    if (filters.timeOfDay) {
      chips.push({
        key: 'timeOfDay',
        label: `Time of day: ${TIME_OF_DAY_LABELS[filters.timeOfDay]}`,
      });
    }
    if (filters.neighborhood) {
      // Each selected neighborhood gets its own removable chip so users can
      // peel them off one at a time without clearing the whole multi-select.
      for (const name of filters.neighborhood) {
        chips.push({ key: `neighborhood:${name}`, label: `Neighborhood: ${name}` });
      }
    }
    if (filters.denomination) {
      // Each selected denomination family gets its own removable chip so users
      // can drop them one at a time without clearing the whole multi-select.
      for (const family of filters.denomination) {
        chips.push({ key: `denomination:${family}`, label: `Denomination: ${family}` });
      }
    }
    if (filters.accessibleOnly) {
      chips.push({ key: 'accessible', label: 'Wheelchair accessible' });
    }
    if (filters.familyFriendly) {
      chips.push({ key: 'family', label: 'Good for kids' });
    }
    if (filters.groupFriendly) {
      chips.push({ key: 'groups', label: 'Good for groups' });
    }
    if (filters.language) {
      // Each selected language gets its own removable chip so users can peel
      // them off one at a time without clearing the whole multi-select.
      for (const lang of filters.language) {
        chips.push({ key: `language:${lang}`, label: `Language: ${lang}` });
      }
    }
    return chips;
  }, [
    filters.type,
    filters.q,
    filters.savedOnly,
    filters.timeOfDay,
    filters.neighborhood,
    filters.denomination,
    filters.accessibleOnly,
    filters.familyFriendly,
    filters.groupFriendly,
    filters.language,
    searchParams,
  ]);

  const updateUrlParams = (
    nextForm: FeedFormState,
    overrides: { page?: number | null } = {},
  ): void => {
    const next = new URLSearchParams();

    if (nextForm.q.trim()) next.set('q', nextForm.q.trim());
    if (nextForm.types.length > 0) next.set('type', nextForm.types.join(','));
    if (nextForm.fromDate) next.set('from', nextForm.fromDate);
    if (nextForm.toDate) next.set('to', nextForm.toDate);
    if (nextForm.savedOnly) next.set('saved', '1');
    if (nextForm.timeOfDay) next.set('timeOfDay', nextForm.timeOfDay);
    if (nextForm.neighborhoods.length > 0) {
      next.set('neighborhood', nextForm.neighborhoods.join(','));
    }
    if (nextForm.denominations.length > 0) {
      next.set('denomination', nextForm.denominations.join(','));
    }
    if (nextForm.accessibleOnly) next.set('accessible', '1');
    if (nextForm.familyFriendly) next.set('family', '1');
    if (nextForm.groupFriendly) next.set('groups', '1');
    if (nextForm.languages.length > 0) {
      next.set('language', nextForm.languages.join(','));
    }
    // Keep the URL clean for the default ordering — only emit `sort=` when
    // the user has explicitly chosen a non-default option.
    if (nextForm.sort !== DEFAULT_SORT) next.set('sort', nextForm.sort);

    const nextPage = overrides.page === undefined ? page : overrides.page;
    if (nextPage && nextPage > 1) {
      next.set('page', String(nextPage));
    }

    setSearchParams(next, { replace: false });
  };

  const handleApplyFilters = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    updateUrlParams(form, { page: 1 });
  };

  const handleClearChip = (key: string): void => {
    const nextForm: FeedFormState = {
      ...form,
      types: [...form.types],
      denominations: [...form.denominations],
      languages: [...form.languages],
      neighborhoods: [...form.neighborhoods],
    };
    if (key.startsWith('type:')) {
      const removed = key.slice('type:'.length);
      nextForm.types = nextForm.types.filter((type) => type !== removed);
    }
    if (key.startsWith('denomination:')) {
      const removed = key.slice('denomination:'.length);
      nextForm.denominations = nextForm.denominations.filter((family) => family !== removed);
    }
    if (key.startsWith('language:')) {
      const removed = key.slice('language:'.length);
      nextForm.languages = nextForm.languages.filter((lang) => lang !== removed);
    }
    if (key.startsWith('neighborhood:')) {
      const removed = key.slice('neighborhood:'.length);
      nextForm.neighborhoods = nextForm.neighborhoods.filter((name) => name !== removed);
    }
    if (key === 'q') nextForm.q = '';
    if (key === 'from') nextForm.fromDate = '';
    if (key === 'to') nextForm.toDate = '';
    if (key === 'saved') nextForm.savedOnly = false;
    if (key === 'timeOfDay') nextForm.timeOfDay = '';
    if (key === 'accessible') nextForm.accessibleOnly = false;
    if (key === 'family') nextForm.familyFriendly = false;
    if (key === 'groups') nextForm.groupFriendly = false;

    setForm(nextForm);
    updateUrlParams(nextForm, { page: 1 });
  };

  const handleToggleType = (type: ChurchEventType): void => {
    const isSelected = form.types.includes(type);
    const nextTypes = isSelected
      ? form.types.filter((existing) => existing !== type)
      : [...form.types, type];
    const nextForm: FeedFormState = { ...form, types: nextTypes };
    setForm(nextForm);
    updateUrlParams(nextForm, { page: 1 });
  };

  const handleToggleDenomination = (family: string): void => {
    const isSelected = form.denominations.includes(family);
    const nextDenominations = isSelected
      ? form.denominations.filter((existing) => existing !== family)
      : [...form.denominations, family];
    const nextForm: FeedFormState = { ...form, denominations: nextDenominations };
    setForm(nextForm);
    updateUrlParams(nextForm, { page: 1 });
  };

  const handleToggleLanguage = (language: string): void => {
    const isSelected = form.languages.includes(language);
    const nextLanguages = isSelected
      ? form.languages.filter((existing) => existing !== language)
      : [...form.languages, language];
    const nextForm: FeedFormState = { ...form, languages: nextLanguages };
    setForm(nextForm);
    updateUrlParams(nextForm, { page: 1 });
  };

  const handleToggleSavedOnly = (): void => {
    const nextForm: FeedFormState = { ...form, savedOnly: !form.savedOnly };
    setForm(nextForm);
    updateUrlParams(nextForm, { page: 1 });
  };

  const handleToggleAccessibleOnly = (): void => {
    const nextForm: FeedFormState = { ...form, accessibleOnly: !form.accessibleOnly };
    setForm(nextForm);
    updateUrlParams(nextForm, { page: 1 });
  };

  const handleToggleFamilyFriendly = (): void => {
    const nextForm: FeedFormState = { ...form, familyFriendly: !form.familyFriendly };
    setForm(nextForm);
    updateUrlParams(nextForm, { page: 1 });
  };

  const handleToggleGroupFriendly = (): void => {
    const nextForm: FeedFormState = { ...form, groupFriendly: !form.groupFriendly };
    setForm(nextForm);
    updateUrlParams(nextForm, { page: 1 });
  };

  const handleClearAll = (): void => {
    setForm(EMPTY_FORM);
    updateUrlParams(EMPTY_FORM, { page: 1 });
  };

  const activePreset: EventDatePresetId | null = useMemo(
    () => matchEventDatePreset(form.fromDate, form.toDate),
    [form.fromDate, form.toDate],
  );

  const handleApplyPreset = (presetId: EventDatePresetId): void => {
    // Toggle off: if the same preset is already applied, clear the date range.
    if (activePreset === presetId) {
      const nextForm: FeedFormState = { ...form, fromDate: '', toDate: '' };
      setForm(nextForm);
      updateUrlParams(nextForm, { page: 1 });
      return;
    }

    const { from, to } = resolveEventDatePreset(presetId);
    const nextForm: FeedFormState = { ...form, fromDate: from, toDate: to };
    setForm(nextForm);
    updateUrlParams(nextForm, { page: 1 });
  };

  const handleSelectTimeOfDay = (bucket: EventTimeOfDay): void => {
    // Toggle off when the same bucket is reselected.
    const nextValue: EventTimeOfDay | '' = form.timeOfDay === bucket ? '' : bucket;
    const nextForm: FeedFormState = { ...form, timeOfDay: nextValue };
    setForm(nextForm);
    updateUrlParams(nextForm, { page: 1 });
  };

  const handleToggleNeighborhood = (name: string): void => {
    const isSelected = form.neighborhoods.includes(name);
    const nextNeighborhoods = isSelected
      ? form.neighborhoods.filter((existing) => existing !== name)
      : [...form.neighborhoods, name];
    const nextForm: FeedFormState = { ...form, neighborhoods: nextNeighborhoods };
    setForm(nextForm);
    updateUrlParams(nextForm, { page: 1 });
  };

  const handleSelectSort = (option: EventSortOption): void => {
    if (form.sort === option) return;
    const nextForm: FeedFormState = { ...form, sort: option };
    setForm(nextForm);
    updateUrlParams(nextForm, { page: 1 });
  };

  // Surface up to MAX_NEIGHBORHOOD_CHIPS neighborhoods as quick chips, but
  // always include any currently-selected neighborhood even when it falls
  // outside the slice (so URL-supplied selections stay clickable instead of
  // silently disappearing). Selected neighborhoods are pinned to the front so
  // active state is easy to scan. Mirrors `visibleDenominationFamilies` and
  // `visibleLanguages` so every multi-select chip rail behaves the same way.
  const MAX_NEIGHBORHOOD_CHIPS = 8;
  const visibleNeighborhoods: string[] = useMemo(() => {
    const ordered: string[] = [];
    const seen = new Set<string>();

    for (const name of form.neighborhoods) {
      if (!seen.has(name)) {
        seen.add(name);
        ordered.push(name);
      }
    }

    for (const option of filterOptions?.neighborhoods ?? []) {
      if (ordered.length >= MAX_NEIGHBORHOOD_CHIPS) break;
      if (!seen.has(option)) {
        seen.add(option);
        ordered.push(option);
      }
    }

    return ordered;
  }, [filterOptions?.neighborhoods, form.neighborhoods]);

  // Surface up to MAX_LANGUAGE_CHIPS languages as quick chips, but always
  // include any currently-selected language even when it falls outside the
  // slice (so URL-supplied selections stay clickable instead of silently
  // disappearing). Selected languages are pinned to the front so active state
  // is easy to scan. Mirrors `visibleDenominationFamilies` so the two
  // multi-select chip rails stay consistent.
  const MAX_LANGUAGE_CHIPS = 6;
  const visibleLanguages: string[] = useMemo(() => {
    const ordered: string[] = [];
    const seen = new Set<string>();

    for (const language of form.languages) {
      if (!seen.has(language)) {
        seen.add(language);
        ordered.push(language);
      }
    }

    for (const option of filterOptions?.languages ?? []) {
      if (ordered.length >= MAX_LANGUAGE_CHIPS) break;
      if (!seen.has(option)) {
        seen.add(option);
        ordered.push(option);
      }
    }

    return ordered;
  }, [filterOptions?.languages, form.languages]);

  // Surface up to MAX_DENOMINATION_CHIPS top families as quick chips, but
  // always include any currently-selected family even when it falls outside
  // the top slice (so URL-supplied selections stay clickable instead of
  // silently disappearing). Selected families are pinned to the front to make
  // active state easy to scan. The list is derived directly from
  // `filterOptions?.denominations` rather than a separately-defaulted variable
  // so the useMemo dependency array stays stable (a fresh `[]` literal would
  // re-trigger the memo on every render).
  const MAX_DENOMINATION_CHIPS = 8;
  const visibleDenominationFamilies: string[] = useMemo(() => {
    const ordered: string[] = [];
    const seen = new Set<string>();

    for (const family of form.denominations) {
      if (!seen.has(family)) {
        seen.add(family);
        ordered.push(family);
      }
    }

    for (const option of filterOptions?.denominations ?? []) {
      if (ordered.length >= MAX_DENOMINATION_CHIPS) break;
      if (!seen.has(option.value)) {
        seen.add(option.value);
        ordered.push(option.value);
      }
    }

    return ordered;
  }, [filterOptions?.denominations, form.denominations]);

  const goToPage = (nextPage: number): void => {
    if (nextPage < 1 || (totalPages > 0 && nextPage > totalPages)) return;
    updateUrlParams(form, { page: nextPage });
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        // jsdom environments may not implement scrollTo options
      }
    }
  };

  const resultsHeading = isLoading
    ? 'Loading upcoming events…'
    : error
      ? 'Events are temporarily unavailable'
      : totalResults === 0
        ? 'No upcoming events match your filters'
        : totalResults === 1
          ? '1 upcoming event'
          : `${totalResults} upcoming events`;

  return (
    <div className="flex-1 bg-background">
      {events.length > 0 && <EventListJsonLd events={events} />}
      <section className="mx-auto max-w-[1760px] px-4 py-10 sm:px-6 lg:px-10">
        <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
          <Sparkles className="h-4 w-4 text-[#FF385C]" />
          San Antonio gatherings
        </div>
        <h1 className="mt-2 text-[32px] font-bold tracking-tight text-foreground sm:text-[36px]">
          Upcoming community events
        </h1>
        <p className="mt-2 max-w-[640px] text-[15px] text-muted-foreground">
          Browse services, studies, volunteer opportunities, and community gatherings from churches
          across San Antonio. Filter by type or date to plan your next visit.
        </p>
        <div className="mt-4">
          {/*
            The aggregated calendar feed honors the same multi-select type,
            denomination, neighborhood, language, AND wheelchair-accessible
            filters as the JSON feed, so the subscribe URL reflects exactly
            the chips the user has toggled. When no filters are active we
            fall back to the city-wide feed so the subscribe action stays
            useful for any selection. The label prioritizes the most specific
            single-axis narrative when possible, otherwise names the count of
            filters, and otherwise points at the city feed.
          */}
          {(() => {
            const selectedTypes = filters.type ?? [];
            const selectedDenominations = filters.denomination ?? [];
            const selectedNeighborhoods = filters.neighborhood ?? [];
            const selectedLanguages = filters.language ?? [];
            const accessibleOnly = filters.accessibleOnly === true;

            const axesInUse = [
              selectedTypes.length > 0,
              selectedDenominations.length > 0,
              selectedNeighborhoods.length > 0,
              selectedLanguages.length > 0,
              accessibleOnly,
            ].filter(Boolean).length;

            let label: string;
            if (axesInUse === 0) {
              label = 'Subscribe to the city events feed';
            } else if (axesInUse === 1 && selectedTypes.length === 1) {
              label = `Subscribe to ${EVENT_TYPE_LABELS[selectedTypes[0]]} events`;
            } else if (axesInUse === 1 && selectedDenominations.length === 1) {
              label = `Subscribe to ${selectedDenominations[0]} events`;
            } else if (axesInUse === 1 && selectedNeighborhoods.length === 1) {
              label = `Subscribe to ${selectedNeighborhoods[0]} events`;
            } else if (axesInUse === 1 && selectedLanguages.length === 1) {
              label = `Subscribe to ${selectedLanguages[0]} events`;
            } else if (axesInUse === 1 && selectedTypes.length > 1) {
              label = `Subscribe to ${selectedTypes.length} event-type feeds`;
            } else if (axesInUse === 1 && selectedDenominations.length > 1) {
              label = `Subscribe to ${selectedDenominations.length} denomination feeds`;
            } else if (axesInUse === 1 && selectedNeighborhoods.length > 1) {
              label = `Subscribe to ${selectedNeighborhoods.length} neighborhood feeds`;
            } else if (axesInUse === 1 && selectedLanguages.length > 1) {
              label = `Subscribe to ${selectedLanguages.length} language feeds`;
            } else if (axesInUse === 1 && accessibleOnly) {
              label = 'Subscribe to wheelchair-accessible events';
            } else {
              // Multiple axes narrowed — keep it short and let the filename
              // carry the specifics.
              label = 'Subscribe to the filtered events feed';
            }

            return (
              <SubscribeToCalendarButton
                feedUrl={buildAggregatedEventsFeedUrl({
                  type: selectedTypes.length > 0 ? selectedTypes : null,
                  denomination: selectedDenominations.length > 0 ? selectedDenominations : null,
                  neighborhood: selectedNeighborhoods.length > 0 ? selectedNeighborhoods : null,
                  language: selectedLanguages.length > 0 ? selectedLanguages : null,
                  accessibleOnly: accessibleOnly ? true : null,
                })}
                label={label}
              />
            );
          })()}
        </div>

        <div
          className="mt-6 flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Quick date ranges"
        >
          {EVENT_DATE_PRESETS.map((preset) => {
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset.id)}
                aria-pressed={isActive}
                className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                  isActive
                    ? 'border-foreground bg-foreground text-white'
                    : 'border-border bg-card text-foreground hover:border-foreground'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleToggleSavedOnly}
              aria-pressed={form.savedOnly}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                form.savedOnly
                  ? 'border-[#FF385C] bg-[#FF385C] text-white'
                  : 'border-border bg-card text-foreground hover:border-foreground'
              }`}
            >
              <Heart
                className="h-3.5 w-3.5"
                fill={form.savedOnly ? 'currentColor' : 'none'}
                strokeWidth={form.savedOnly ? 0 : 2}
              />
              From saved churches
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleToggleAccessibleOnly}
            aria-pressed={form.accessibleOnly}
            aria-label="Show only events at wheelchair-accessible churches"
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              form.accessibleOnly
                ? 'border-foreground bg-foreground text-white'
                : 'border-border bg-card text-foreground hover:border-foreground'
            }`}
          >
            <Accessibility className="h-3.5 w-3.5" />
            Wheelchair accessible
          </button>
          <button
            type="button"
            onClick={handleToggleFamilyFriendly}
            aria-pressed={form.familyFriendly}
            aria-label="Show only events at churches that are good for kids"
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              form.familyFriendly
                ? 'border-foreground bg-foreground text-white'
                : 'border-border bg-card text-foreground hover:border-foreground'
            }`}
          >
            <Baby className="h-3.5 w-3.5" />
            Good for kids
          </button>
          <button
            type="button"
            onClick={handleToggleGroupFriendly}
            aria-pressed={form.groupFriendly}
            aria-label="Show only events at churches that are good for groups"
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              form.groupFriendly
                ? 'border-foreground bg-foreground text-white'
                : 'border-border bg-card text-foreground hover:border-foreground'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Good for groups
          </button>
        </div>

        <div
          className="mt-3 flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Event type"
        >
          <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
            Event type
          </span>
          {EVENT_TYPES.map((type) => {
            const isActive = form.types.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleToggleType(type)}
                aria-pressed={isActive}
                className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                  isActive
                    ? 'border-foreground bg-foreground text-white'
                    : 'border-border bg-card text-foreground hover:border-foreground'
                }`}
              >
                {EVENT_TYPE_LABELS[type]}
              </button>
            );
          })}
        </div>

        {visibleDenominationFamilies.length > 0 ? (
          <div
            className="mt-3 flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Denomination"
          >
            <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              Denomination
            </span>
            {visibleDenominationFamilies.map((family) => {
              const isActive = form.denominations.includes(family);
              return (
                <button
                  key={family}
                  type="button"
                  onClick={() => handleToggleDenomination(family)}
                  aria-pressed={isActive}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                    isActive
                      ? 'border-foreground bg-foreground text-white'
                      : 'border-border bg-card text-foreground hover:border-foreground'
                  }`}
                >
                  {family}
                </button>
              );
            })}
          </div>
        ) : null}

        {visibleLanguages.length > 0 ? (
          <div
            className="mt-3 flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Language"
          >
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Languages className="h-3.5 w-3.5" />
              Language
            </span>
            {visibleLanguages.map((language) => {
              const isActive = form.languages.includes(language);
              return (
                <button
                  key={language}
                  type="button"
                  onClick={() => handleToggleLanguage(language)}
                  aria-pressed={isActive}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                    isActive
                      ? 'border-foreground bg-foreground text-white'
                      : 'border-border bg-card text-foreground hover:border-foreground'
                  }`}
                >
                  {language}
                </button>
              );
            })}
          </div>
        ) : null}

        {visibleNeighborhoods.length > 0 ? (
          <div
            className="mt-3 flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Neighborhood"
          >
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              Neighborhood
            </span>
            {visibleNeighborhoods.map((name) => {
              const isActive = form.neighborhoods.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleToggleNeighborhood(name)}
                  aria-pressed={isActive}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                    isActive
                      ? 'border-foreground bg-foreground text-white'
                      : 'border-border bg-card text-foreground hover:border-foreground'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        ) : null}

        <div
          className="mt-3 flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Time of day"
        >
          <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
            Time of day
          </span>
          {EVENT_TIME_OF_DAY.map((bucket) => {
            const isActive = form.timeOfDay === bucket;
            return (
              <button
                key={bucket}
                type="button"
                onClick={() => handleSelectTimeOfDay(bucket)}
                aria-pressed={isActive}
                className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                  isActive
                    ? 'border-foreground bg-foreground text-white'
                    : 'border-border bg-card text-foreground hover:border-foreground'
                }`}
              >
                {TIME_OF_DAY_LABELS[bucket]}
              </button>
            );
          })}
        </div>

        <form
          onSubmit={handleApplyFilters}
          className="mt-4 rounded-[20px] border border-border bg-card p-5 shadow-airbnb-subtle"
          aria-label="Event filters"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,2fr),minmax(0,1fr),minmax(0,1fr)]">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                Search
              </span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={form.q}
                  onChange={(event) => setForm((prev) => ({ ...prev, q: event.target.value }))}
                  placeholder="Keyword, church, or topic"
                  className="w-full rounded-[10px] border border-border bg-background px-9 py-2.5 text-[14px] text-foreground outline-none transition-colors focus:border-foreground"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                From
              </span>
              <input
                type="date"
                value={form.fromDate}
                onChange={(event) => setForm((prev) => ({ ...prev, fromDate: event.target.value }))}
                className="w-full rounded-[10px] border border-border bg-background px-3 py-2.5 text-[14px] text-foreground outline-none transition-colors focus:border-foreground"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                To
              </span>
              <input
                type="date"
                value={form.toDate}
                min={form.fromDate || undefined}
                onChange={(event) => setForm((prev) => ({ ...prev, toDate: event.target.value }))}
                className="w-full rounded-[10px] border border-border bg-background px-3 py-2.5 text-[14px] text-foreground outline-none transition-colors focus:border-foreground"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-[10px] bg-foreground px-5 py-2.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              Apply filters
            </button>
            {appliedChips.length > 0 ? (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[13px] font-semibold text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
              >
                Clear all
              </button>
            ) : null}
          </div>
        </form>

        {appliedChips.length > 0 ? (
          <div className="mt-5 flex flex-wrap items-center gap-2" aria-label="Active filters">
            {appliedChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => handleClearChip(chip.key)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[13px] font-semibold text-foreground transition-colors hover:border-foreground"
              >
                <span>{chip.label}</span>
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-[16px] font-semibold text-foreground">{resultsHeading}</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {isFetching && !isLoading
                ? 'Refreshing…'
                : form.sort === 'recent'
                  ? 'Sorted by recently announced'
                  : 'Sorted by soonest start'}
            </p>
          </div>
          <div
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1"
            role="group"
            aria-label="Sort events"
          >
            {EVENT_SORT_OPTIONS.map((option) => {
              const isActive = form.sort === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectSort(option)}
                  aria-pressed={isActive}
                  className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                    isActive ? 'bg-foreground text-white' : 'text-foreground hover:bg-muted/40'
                  }`}
                >
                  {SORT_LABELS[option]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[180px] animate-pulse rounded-2xl border border-border bg-muted/40"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-[15px] font-semibold text-foreground">
                We couldn&apos;t load the events feed right now.
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Please try again in a moment.
              </p>
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-[15px] font-semibold text-foreground">
                {filters.savedOnly
                  ? 'None of your saved churches have upcoming events yet.'
                  : 'No events match those filters yet.'}
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {filters.savedOnly
                  ? 'Try clearing the saved-churches filter, widening your date range, or saving more churches.'
                  : 'Try widening your date range or clearing the event type.'}
              </p>
              {appliedChips.length > 0 ? (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="mt-4 rounded-[10px] border border-border px-4 py-2 text-[13px] font-semibold text-foreground transition-colors hover:border-foreground"
                >
                  Clear all filters
                </button>
              ) : null}
            </div>
          ) : form.sort === 'recent' ? (
            // Day-grouping headers assume a chronological feed. Under the
            // "Recently announced" ordering events cluster by announcement
            // date rather than day of occurrence, so we render a flat grid
            // instead to avoid jumbled Today/Tomorrow headers.
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.occurrenceId} event={event} />
              ))}
            </div>
          ) : (
            <div className="space-y-10">
              {eventGroups.map((group) => (
                <section key={group.dayKey} aria-label={group.label}>
                  <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-border pb-2">
                    <h3 className="text-[18px] font-bold tracking-tight text-foreground">
                      {group.label}
                    </h3>
                    <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {group.events.length === 1 ? '1 event' : `${group.events.length} events`}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {group.events.map((event) => (
                      <EventCard key={event.occurrenceId} event={event} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 ? (
          <nav
            className="mt-10 flex items-center justify-center gap-3"
            aria-label="Events pagination"
          >
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-card px-4 py-2 text-[13px] font-semibold text-foreground transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="text-[13px] font-semibold text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-card px-4 py-2 text-[13px] font-semibold text-foreground transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        ) : null}
      </section>
    </div>
  );
};

export default EventsDiscoveryPage;
