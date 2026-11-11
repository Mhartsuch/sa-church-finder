import { familyLabel } from '@/lib/format';
import { IChurchFilters, ISearchRequest, SortOption, TimeOfDay } from '@/types/church';

const SORTS: SortOption[] = ['relevance', 'rating', 'distance', 'name'];
const TIMES: TimeOfDay[] = ['morning', 'afternoon', 'evening'];

export const EMPTY_FILTERS: IChurchFilters = {
  denominations: [],
  languages: [],
  wheelchairAccessible: false,
  goodForChildren: false,
  goodForGroups: false,
  sort: 'relevance',
};

const list = (value: string | null): string[] =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const intInRange = (value: string | null, min: number, max: number): number | undefined => {
  if (value === null || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : undefined;
};

/** Parse browse filters from a URL query string. Unknown or invalid values are dropped. */
export const parseFilters = (params: URLSearchParams): IChurchFilters => {
  const sort = params.get('sort') as SortOption | null;
  const time = params.get('time') as TimeOfDay | null;
  const q = params.get('q')?.trim();
  const neighborhood = params.get('neighborhood')?.trim();

  return {
    q: q || undefined,
    denominations: list(params.get('denomination')),
    day: intInRange(params.get('day'), 0, 6),
    time: time && TIMES.includes(time) ? time : undefined,
    languages: list(params.get('language')),
    neighborhood: neighborhood || undefined,
    wheelchairAccessible: params.get('accessible') === '1',
    goodForChildren: params.get('kids') === '1',
    goodForGroups: params.get('groups') === '1',
    minRating: intInRange(params.get('rating'), 1, 5),
    sort: sort && SORTS.includes(sort) ? sort : 'relevance',
  };
};

/** Serialize browse filters into a compact, shareable URL query string. */
export const filtersToParams = (filters: IChurchFilters): URLSearchParams => {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.denominations.length) params.set('denomination', filters.denominations.join(','));
  if (filters.day !== undefined) params.set('day', String(filters.day));
  if (filters.time) params.set('time', filters.time);
  if (filters.languages.length) params.set('language', filters.languages.join(','));
  if (filters.neighborhood) params.set('neighborhood', filters.neighborhood);
  if (filters.wheelchairAccessible) params.set('accessible', '1');
  if (filters.goodForChildren) params.set('kids', '1');
  if (filters.goodForGroups) params.set('groups', '1');
  if (filters.minRating) params.set('rating', String(filters.minRating));
  if (filters.sort !== 'relevance') params.set('sort', filters.sort);
  return params;
};

/** Number of active refinements shown on the "Filters" button (keyword and sort excluded). */
export const countActiveFilters = (filters: IChurchFilters): number =>
  filters.denominations.length +
  filters.languages.length +
  (filters.day !== undefined ? 1 : 0) +
  (filters.time ? 1 : 0) +
  (filters.neighborhood ? 1 : 0) +
  (filters.wheelchairAccessible ? 1 : 0) +
  (filters.goodForChildren ? 1 : 0) +
  (filters.goodForGroups ? 1 : 0) +
  (filters.minRating ? 1 : 0);

/** Build the API query string for `GET /churches`. */
export const toApiQuery = (request: ISearchRequest): string => {
  const params = new URLSearchParams();
  if (request.q) params.set('q', request.q);
  if (request.denominations.length) params.set('denomination', request.denominations.join(','));
  if (request.day !== undefined) params.set('day', String(request.day));
  if (request.time) params.set('time', request.time);
  if (request.languages.length) params.set('language', request.languages.join(','));
  if (request.neighborhood) params.set('neighborhood', request.neighborhood);
  if (request.wheelchairAccessible) params.set('wheelchairAccessible', 'true');
  if (request.goodForChildren) params.set('goodForChildren', 'true');
  if (request.goodForGroups) params.set('goodForGroups', 'true');
  if (request.minRating) params.set('minRating', String(request.minRating));
  params.set('sort', request.sort);
  if (request.bounds) params.set('bounds', request.bounds);
  else params.set('radius', '25'); // API maximum; covers Bexar County from downtown
  if (request.page) params.set('page', String(request.page));
  if (request.pageSize) params.set('pageSize', String(request.pageSize));
  return params.toString();
};

/**
 * A short human title for a set of filters — "Lutheran churches in Stone Oak",
 * "Churches matching “grace”" — or undefined when nothing narrows the list.
 * Used for the browser tab, history entries and shared links.
 */
export const describeFilters = (filters: IChurchFilters): string | undefined => {
  const kind =
    filters.denominations.length === 1 ? `${familyLabel(filters.denominations[0])} churches` : null;
  const place = filters.neighborhood ? `in ${filters.neighborhood}` : null;
  const language =
    filters.languages.length === 1 && filters.languages[0] !== 'English'
      ? `with ${filters.languages[0]} services`
      : null;
  const query = filters.q?.trim() ? `matching “${filters.q.trim()}”` : null;

  const parts = [kind ?? (place || language || query ? 'Churches' : null), place, language, query];
  const title = parts.filter(Boolean).join(' ');
  return title || undefined;
};
