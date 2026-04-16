/**
 * Utilities for generating "Add to Calendar" links and ICS file contents
 * from event payloads. The functions are pure and framework-agnostic so
 * they can be unit tested without a DOM.
 */

const DEFAULT_DURATION_MINUTES = 60;

export interface CalendarEventInput {
  /** Stable identifier used as the ICS UID. */
  id: string;
  title: string;
  description?: string | null;
  /** ISO 8601 start timestamp. */
  startTime: string;
  /** ISO 8601 end timestamp; falls back to start + 1h when omitted. */
  endTime?: string | null;
  /** Human-readable location for the calendar entry. */
  location?: string | null;
  /** Absolute URL to link from the calendar entry. */
  url?: string | null;
}

interface ResolvedRange {
  start: Date;
  end: Date;
}

const sanitizeText = (value: string | null | undefined): string =>
  (value ?? '').replace(/\s+/g, ' ').trim();

const resolveRange = (input: CalendarEventInput): ResolvedRange => {
  const start = new Date(input.startTime);
  if (Number.isNaN(start.getTime())) {
    throw new Error(`calendar-links: invalid startTime "${input.startTime}"`);
  }

  let end: Date;
  if (input.endTime) {
    end = new Date(input.endTime);
    if (Number.isNaN(end.getTime())) {
      throw new Error(`calendar-links: invalid endTime "${input.endTime}"`);
    }
  } else {
    end = new Date(start.getTime() + DEFAULT_DURATION_MINUTES * 60 * 1000);
  }

  // Guarantee end > start so calendar clients don't reject the invite.
  if (end.getTime() <= start.getTime()) {
    end = new Date(start.getTime() + DEFAULT_DURATION_MINUTES * 60 * 1000);
  }

  return { start, end };
};

/**
 * Format a Date as a UTC "basic format" timestamp used by both ICS and the
 * Google Calendar web URL: YYYYMMDDTHHMMSSZ.
 */
export const formatUtcBasic = (date: Date): string => {
  const pad = (value: number): string => value.toString().padStart(2, '0');
  return (
    `${date.getUTCFullYear()}` +
    `${pad(date.getUTCMonth() + 1)}` +
    `${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}` +
    `${pad(date.getUTCMinutes())}` +
    `${pad(date.getUTCSeconds())}Z`
  );
};

const joinDetails = (
  description: string | null | undefined,
  url: string | null | undefined,
): string => {
  const parts: string[] = [];
  const cleanDescription = sanitizeText(description);
  if (cleanDescription) parts.push(cleanDescription);
  if (url) parts.push(url);
  return parts.join('\n\n');
};

/**
 * Generate a Google Calendar "create event" URL.
 * https://support.google.com/calendar/thread/31500271
 */
export const buildGoogleCalendarUrl = (input: CalendarEventInput): string => {
  const { start, end } = resolveRange(input);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: sanitizeText(input.title) || 'Event',
    dates: `${formatUtcBasic(start)}/${formatUtcBasic(end)}`,
  });

  const details = joinDetails(input.description, input.url);
  if (details) params.set('details', details);

  const location = sanitizeText(input.location);
  if (location) params.set('location', location);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Generate an Outlook.com web calendar "create event" deep link.
 */
export const buildOutlookCalendarUrl = (input: CalendarEventInput): string => {
  const { start, end } = resolveRange(input);
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: sanitizeText(input.title) || 'Event',
    startdt: start.toISOString(),
    enddt: end.toISOString(),
  });

  const details = joinDetails(input.description, input.url);
  if (details) params.set('body', details);

  const location = sanitizeText(input.location);
  if (location) params.set('location', location);

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

/**
 * Escape a string for use in an ICS TEXT field per RFC 5545 §3.3.11.
 */
const escapeIcsText = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

/**
 * Generate a self-contained ICS file body for the event. The returned string
 * uses CRLF line endings as required by RFC 5545 and can be served as a
 * `text/calendar` download or a `data:` URI.
 */
export const buildIcsContent = (input: CalendarEventInput): string => {
  const { start, end } = resolveRange(input);
  const now = new Date();

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SA Church Finder//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${escapeIcsText(input.id)}@sachurchfinder.com`,
    `DTSTAMP:${formatUtcBasic(now)}`,
    `DTSTART:${formatUtcBasic(start)}`,
    `DTEND:${formatUtcBasic(end)}`,
    `SUMMARY:${escapeIcsText(sanitizeText(input.title) || 'Event')}`,
  ];

  const description = sanitizeText(input.description);
  if (description) lines.push(`DESCRIPTION:${escapeIcsText(description)}`);

  const location = sanitizeText(input.location);
  if (location) lines.push(`LOCATION:${escapeIcsText(location)}`);

  if (input.url) lines.push(`URL:${escapeIcsText(input.url)}`);

  lines.push('END:VEVENT', 'END:VCALENDAR');

  return `${lines.join('\r\n')}\r\n`;
};

/**
 * Slugify a title into a safe filename stem.
 */
const slugifyFilename = (value: string): string =>
  sanitizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'event';

export const buildIcsFilename = (input: CalendarEventInput): string =>
  `${slugifyFilename(input.title)}.ics`;

/**
 * Generate a `data:` URI that downloads the event as an ICS file when opened.
 * Falls back to plain encodeURIComponent so it works in any runtime, including
 * jsdom.
 */
export const buildIcsDataUri = (input: CalendarEventInput): string => {
  const body = buildIcsContent(input);
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`;
};
