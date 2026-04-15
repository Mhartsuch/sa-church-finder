import { describe, expect, it } from 'vitest';

import {
  buildGoogleCalendarUrl,
  buildIcsContent,
  buildIcsDataUri,
  buildIcsFilename,
  buildOutlookCalendarUrl,
  formatUtcBasic,
  type CalendarEventInput,
} from './calendar-links';

const baseEvent: CalendarEventInput = {
  id: 'event-123',
  title: 'Sunday Service',
  description: 'Weekly gathering with worship and teaching.',
  startTime: '2026-05-03T15:00:00.000Z', // Sunday 10:00 AM CDT
  endTime: '2026-05-03T16:30:00.000Z',
  location: '100 Main St, San Antonio, TX 78205',
  url: 'https://sachurchfinder.com/churches/grace-chapel',
};

describe('formatUtcBasic', () => {
  it('formats a Date into YYYYMMDDTHHMMSSZ in UTC', () => {
    const date = new Date('2026-01-09T04:05:06.789Z');
    expect(formatUtcBasic(date)).toBe('20260109T040506Z');
  });
});

describe('buildGoogleCalendarUrl', () => {
  it('includes title, dates, details, and location params', () => {
    const url = buildGoogleCalendarUrl(baseEvent);
    const parsed = new URL(url);

    expect(parsed.origin).toBe('https://calendar.google.com');
    expect(parsed.pathname).toBe('/calendar/render');
    expect(parsed.searchParams.get('action')).toBe('TEMPLATE');
    expect(parsed.searchParams.get('text')).toBe('Sunday Service');
    expect(parsed.searchParams.get('dates')).toBe('20260503T150000Z/20260503T163000Z');
    expect(parsed.searchParams.get('location')).toBe('100 Main St, San Antonio, TX 78205');
    expect(parsed.searchParams.get('details')).toContain('Weekly gathering');
    expect(parsed.searchParams.get('details')).toContain(baseEvent.url!);
  });

  it('falls back to a 1-hour block when no endTime is provided', () => {
    const url = buildGoogleCalendarUrl({ ...baseEvent, endTime: null });
    const dates = new URL(url).searchParams.get('dates');
    expect(dates).toBe('20260503T150000Z/20260503T160000Z');
  });

  it('throws when startTime is not parseable', () => {
    expect(() => buildGoogleCalendarUrl({ ...baseEvent, startTime: 'not-a-date' })).toThrow(
      /invalid startTime/,
    );
  });

  it('ensures end is after start when endTime is before start', () => {
    const url = buildGoogleCalendarUrl({
      ...baseEvent,
      endTime: '2026-05-03T14:00:00.000Z', // earlier than start
    });
    const dates = new URL(url).searchParams.get('dates');
    expect(dates).toBe('20260503T150000Z/20260503T160000Z');
  });

  it('uses a safe default title when the title is blank', () => {
    const url = buildGoogleCalendarUrl({ ...baseEvent, title: '   ' });
    expect(new URL(url).searchParams.get('text')).toBe('Event');
  });
});

describe('buildOutlookCalendarUrl', () => {
  it('includes the Outlook compose deep-link params with ISO timestamps', () => {
    const url = buildOutlookCalendarUrl(baseEvent);
    const parsed = new URL(url);

    expect(parsed.origin).toBe('https://outlook.live.com');
    expect(parsed.searchParams.get('rru')).toBe('addevent');
    expect(parsed.searchParams.get('path')).toBe('/calendar/action/compose');
    expect(parsed.searchParams.get('subject')).toBe('Sunday Service');
    expect(parsed.searchParams.get('startdt')).toBe('2026-05-03T15:00:00.000Z');
    expect(parsed.searchParams.get('enddt')).toBe('2026-05-03T16:30:00.000Z');
    expect(parsed.searchParams.get('location')).toBe('100 Main St, San Antonio, TX 78205');
  });
});

describe('buildIcsContent', () => {
  it('produces a minimal but valid VCALENDAR body', () => {
    const body = buildIcsContent(baseEvent);

    expect(body.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(body.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(body).toContain('VERSION:2.0');
    expect(body).toContain('BEGIN:VEVENT');
    expect(body).toContain('END:VEVENT');
    expect(body).toContain('UID:event-123@sachurchfinder.com');
    expect(body).toContain('DTSTART:20260503T150000Z');
    expect(body).toContain('DTEND:20260503T163000Z');
    expect(body).toContain('SUMMARY:Sunday Service');
    expect(body).toContain('LOCATION:100 Main St\\, San Antonio\\, TX 78205');
    expect(body).toContain('URL:https://sachurchfinder.com/churches/grace-chapel');
  });

  it('escapes semicolons, commas, backslashes, and newlines in descriptions', () => {
    const body = buildIcsContent({
      ...baseEvent,
      description: 'Line 1\nLine 2; with, chars\\back',
    });
    // After sanitizeText collapses whitespace, newlines are folded to spaces,
    // but commas/semicolons/backslashes remain and must be escaped.
    expect(body).toContain('DESCRIPTION:Line 1 Line 2\\; with\\, chars\\\\back');
  });

  it('omits optional fields when they are empty', () => {
    const body = buildIcsContent({
      id: 'evt-2',
      title: 'Prayer',
      startTime: '2026-05-03T15:00:00.000Z',
    });
    expect(body).not.toContain('DESCRIPTION:');
    expect(body).not.toContain('LOCATION:');
    expect(body).not.toContain('URL:');
    expect(body).toContain('SUMMARY:Prayer');
  });

  it('defaults the end time to one hour after start when missing', () => {
    const body = buildIcsContent({ ...baseEvent, endTime: null });
    expect(body).toContain('DTSTART:20260503T150000Z');
    expect(body).toContain('DTEND:20260503T160000Z');
  });
});

describe('buildIcsDataUri', () => {
  it('is a text/calendar data URI whose payload decodes to the ICS body', () => {
    const uri = buildIcsDataUri(baseEvent);
    expect(uri.startsWith('data:text/calendar;charset=utf-8,')).toBe(true);

    const encoded = uri.replace('data:text/calendar;charset=utf-8,', '');
    const decoded = decodeURIComponent(encoded);
    expect(decoded).toBe(buildIcsContent(baseEvent));
  });
});

describe('buildIcsFilename', () => {
  it('slugifies the title into a safe filename', () => {
    expect(buildIcsFilename({ ...baseEvent, title: 'Sunday Service! @ 10AM' })).toBe(
      'sunday-service-10am.ics',
    );
  });

  it('falls back to "event.ics" when the title is empty', () => {
    expect(buildIcsFilename({ ...baseEvent, title: '' })).toBe('event.ics');
  });
});
