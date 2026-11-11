import { describe, expect, it } from 'vitest';

import {
  churchCount,
  churchKind,
  churchLocation,
  churchSubtitle,
  correctionUrl,
  directionsUrl,
  formatAddress,
  formatList,
  formatNextService,
  formatRating,
  formatTime,
  getNextService,
  getRating,
  isWorshipService,
  serviceLabel,
  streetAddress,
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

describe('addresses', () => {
  const imported = {
    address: '1321 El Paso St, San Antonio, TX 78207, USA',
    city: 'San Antonio',
    state: 'TX',
    zipCode: '78207',
  };
  const handEntered = { ...imported, address: '1321 El Paso St' };

  it('shows each part of an imported full address exactly once', () => {
    expect(formatAddress(imported)).toBe('1321 El Paso St, San Antonio, TX 78207');
    expect(streetAddress(imported)).toBe('1321 El Paso St');
  });

  it('completes a street-only address', () => {
    expect(formatAddress(handEntered)).toBe('1321 El Paso St, San Antonio, TX 78207');
  });

  it('keeps a comma that belongs to the street line', () => {
    expect(streetAddress({ ...imported, address: '100 Main St, Suite 4' })).toBe(
      '100 Main St, Suite 4',
    );
  });

  it('builds a directions link from the de-duplicated address', () => {
    expect(directionsUrl(imported)).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=1321%20El%20Paso%20St%2C%20San%20Antonio%2C%20TX%2078207',
    );
  });
});

describe('formatList', () => {
  it('joins languages naturally', () => {
    expect(formatList(['English'])).toBe('English');
    expect(formatList(['English', 'Spanish'])).toBe('English and Spanish');
    expect(formatList(['English', 'Korean', 'Spanish'])).toBe('English, Korean, and Spanish');
  });
});

describe('worship services', () => {
  const typed = (dayOfWeek: number, startTime: string, serviceType: string): IChurchService => ({
    ...service(dayOfWeek, startTime),
    serviceType,
  });

  it('tells worship from the rest of the weekly calendar', () => {
    for (const type of [
      'Service',
      'Mass',
      'Vigil Mass',
      'Traditional',
      'Divine Liturgy',
      'Worship',
    ]) {
      expect(isWorshipService(typed(0, '10:00', type))).toBe(true);
    }
    for (const type of ['Bible Study', 'Sunday School', 'Youth', 'Confession', 'Prayer Meeting']) {
      expect(isWorshipService(typed(0, '10:00', type))).toBe(false);
    }
    expect(isWorshipService(typed(0, '10:00', 'Meeting for Worship'))).toBe(true);
  });

  it('announces the next worship service, not the next Bible study', () => {
    const services = [typed(3, '19:00', 'Bible Study'), typed(0, '10:30', 'Traditional')];
    expect(formatNextService(services, WEDNESDAY_NOON)).toBe('Sunday · 10:30 AM');
  });

  it('falls back to any gathering when no worship service is listed', () => {
    const services = [typed(3, '19:00', 'Bible Study')];
    expect(formatNextService(services, WEDNESDAY_NOON)).toBe('Today · 7 PM');
  });
});

describe('church labels', () => {
  it('names the kind of church without doubling the word', () => {
    expect(churchKind({ denomination: 'Catholic', denominationFamily: 'Catholic' })).toBe(
      'Catholic church',
    );
    expect(
      churchKind({ denomination: 'Church of Christ', denominationFamily: 'Restoration Movement' }),
    ).toBe('Church of Christ congregation');
    expect(
      churchKind({
        denomination: "Jehovah's Witnesses",
        denominationFamily: "Jehovah's Witnesses",
      }),
    ).toBe("Jehovah's Witnesses congregation");
    expect(churchKind({ denomination: null, denominationFamily: null })).toBe('Christian church');
  });

  it('does not repeat a suburb that is both neighborhood and city', () => {
    expect(churchLocation({ neighborhood: 'Windcrest', city: 'Windcrest', state: 'TX' })).toBe(
      'Windcrest, TX',
    );
    expect(churchLocation({ neighborhood: 'West Side', city: 'San Antonio', state: 'TX' })).toBe(
      'West Side, San Antonio, TX',
    );
    expect(churchLocation({ neighborhood: null, city: 'San Antonio', state: 'TX' })).toBe(
      'San Antonio, TX',
    );
  });

  it('uses plain-language family names on cards', () => {
    expect(
      churchSubtitle({
        neighborhood: 'Leon Valley',
        denomination: 'Church of Christ',
        denominationFamily: 'Restoration Movement',
      }),
    ).toBe('Leon Valley · Church of Christ');
    expect(
      churchSubtitle({
        neighborhood: 'Downtown',
        denomination: 'Quaker',
        denominationFamily: 'Other',
      }),
    ).toBe('Downtown · Quaker');
    expect(
      churchSubtitle({ neighborhood: 'Downtown', denomination: null, denominationFamily: null }),
    ).toBe('Downtown');
  });
});

describe('service labels and corrections', () => {
  it('shows the generic import label as a worship service', () => {
    expect(serviceLabel({ serviceType: 'Service' })).toBe('Worship service');
    expect(serviceLabel({ serviceType: 'Vigil Mass' })).toBe('Vigil Mass');
  });

  it('builds a correction email that names the listing', () => {
    const url = correctionUrl({ name: "St. Mary's Church", slug: 'st-marys-church' });
    expect(url).toContain('mailto:admin@sachurchfinder.com?subject=Correction%20for%20St.%20Mary');
    expect(decodeURIComponent(url)).toContain(
      'https://sachurchfinder.com/churches/st-marys-church',
    );
  });
});
