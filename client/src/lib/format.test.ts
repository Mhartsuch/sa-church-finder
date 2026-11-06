import { describe, expect, it } from 'vitest';

import {
  churchCount,
  formatNextService,
  formatRating,
  formatTime,
  getNextService,
  getRating,
} from '@/lib/format';
import { IChurchService } from '@/types/church';

const service = (dayOfWeek: number, startTime: string): IChurchService => ({
  id: `${dayOfWeek}-${startTime}`,
  dayOfWeek,
  startTime,
  endTime: null,
  serviceType: 'Worship',
  language: 'English',
});

// Wednesday 2026-11-04 at 12:00 in San Antonio (18:00 UTC, CST = UTC-6).
const WEDNESDAY_NOON = new Date('2026-11-04T18:00:00Z');

describe('formatTime', () => {
  it('formats 24h times', () => {
    expect(formatTime('09:30')).toBe('9:30 AM');
    expect(formatTime('18:00')).toBe('6 PM');
    expect(formatTime('00:15')).toBe('12:15 AM');
    expect(formatTime('12:00')).toBe('12 PM');
  });
});

describe('getNextService', () => {
  it('returns null when there are no services', () => {
    expect(getNextService([], WEDNESDAY_NOON)).toBeNull();
  });

  it('finds a later service today', () => {
    const next = getNextService([service(0, '09:00'), service(3, '19:00')], WEDNESDAY_NOON);
    expect(next?.dayLabel).toBe('Today');
    expect(next?.service.startTime).toBe('19:00');
  });

  it('wraps to the coming week once today’s service has started', () => {
    const next = getNextService([service(3, '10:00'), service(0, '09:00')], WEDNESDAY_NOON);
    expect(next?.dayLabel).toBe('Sunday');
  });

  it('labels tomorrow', () => {
    expect(formatNextService([service(4, '06:30')], WEDNESDAY_NOON)).toBe('Tomorrow · 6:30 AM');
  });
});

describe('ratings', () => {
  it('prefers on-site reviews over Google', () => {
    expect(
      getRating({ avgRating: 4.5, reviewCount: 2, googleRating: 4.9, googleReviewCount: 300 }),
    ).toEqual({
      value: 4.5,
      count: 2,
    });
    expect(
      getRating({ avgRating: 0, reviewCount: 0, googleRating: 4.9, googleReviewCount: 300 }),
    ).toEqual({
      value: 4.9,
      count: 300,
    });
    expect(
      getRating({ avgRating: 0, reviewCount: 0, googleRating: null, googleReviewCount: null }),
    ).toBeNull();
  });

  it('formats ratings like Airbnb', () => {
    expect(formatRating(4.7)).toBe('4.7');
    expect(formatRating(4.8667)).toBe('4.87');
    expect(formatRating(5)).toBe('5.0');
  });

  it('pluralizes church counts', () => {
    expect(churchCount(1)).toBe('1 church');
    expect(churchCount(1200)).toBe('1,200 churches');
  });
});
