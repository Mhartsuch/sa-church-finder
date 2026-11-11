import { describe, expect, it } from 'vitest';

import {
  describeFilters,
  countActiveFilters,
  EMPTY_FILTERS,
  filtersToParams,
  parseFilters,
  toApiQuery,
} from '@/lib/search-params';

describe('search params', () => {
  it('round-trips filters through the URL', () => {
    const filters = {
      ...EMPTY_FILTERS,
      q: 'grace',
      denominations: ['Baptist', 'Methodist'],
      day: 0,
      time: 'morning' as const,
      languages: ['Spanish'],
      neighborhood: 'Alamo Heights',
      goodForChildren: true,
      minRating: 4,
      sort: 'rating' as const,
    };
    expect(parseFilters(filtersToParams(filters))).toEqual(filters);
  });

  it('produces an empty query string for default filters', () => {
    expect(filtersToParams(EMPTY_FILTERS).toString()).toBe('');
  });

  it('drops invalid values', () => {
    const filters = parseFilters(new URLSearchParams('day=9&time=midnight&sort=price&rating=7'));
    expect(filters).toEqual(EMPTY_FILTERS);
  });

  it('counts active refinements but not keyword or sort', () => {
    expect(
      countActiveFilters({
        ...EMPTY_FILTERS,
        q: 'x',
        sort: 'name',
        denominations: ['A', 'B'],
        day: 3,
      }),
    ).toBe(3);
  });

  it('maps filters to the API contract', () => {
    const query = new URLSearchParams(
      toApiQuery({
        ...EMPTY_FILTERS,
        wheelchairAccessible: true,
        languages: ['English', 'Spanish'],
        page: 2,
        pageSize: 24,
      }),
    );
    expect(query.get('wheelchairAccessible')).toBe('true');
    expect(query.get('language')).toBe('English,Spanish');
    expect(query.get('sort')).toBe('relevance');
    expect(query.get('radius')).toBe('25');
    expect(query.get('page')).toBe('2');
  });

  it('uses map bounds instead of a radius when provided', () => {
    const query = new URLSearchParams(toApiQuery({ ...EMPTY_FILTERS, bounds: '29,-99,30,-98' }));
    expect(query.get('bounds')).toBe('29,-99,30,-98');
    expect(query.has('radius')).toBe(false);
  });
});

describe('describeFilters', () => {
  it('is empty when nothing narrows the list', () => {
    expect(describeFilters(EMPTY_FILTERS)).toBeUndefined();
    expect(describeFilters({ ...EMPTY_FILTERS, sort: 'rating', minRating: 4 })).toBeUndefined();
  });

  it('names the tradition, place, language and search term', () => {
    expect(
      describeFilters({ ...EMPTY_FILTERS, denominations: ['Lutheran'], neighborhood: 'Stone Oak' }),
    ).toBe('Lutheran churches in Stone Oak');
    expect(describeFilters({ ...EMPTY_FILTERS, denominations: ['Restoration Movement'] })).toBe(
      'Church of Christ churches',
    );
    expect(describeFilters({ ...EMPTY_FILTERS, languages: ['Spanish'] })).toBe(
      'Churches with Spanish services',
    );
    expect(describeFilters({ ...EMPTY_FILTERS, q: ' grace ' })).toBe('Churches matching “grace”');
  });

  it('does not name a tradition when several are selected', () => {
    expect(
      describeFilters({
        ...EMPTY_FILTERS,
        denominations: ['Baptist', 'Methodist'],
        neighborhood: 'Downtown',
      }),
    ).toBe('Churches in Downtown');
  });
});
