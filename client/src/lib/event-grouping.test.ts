import { describe, expect, it } from 'vitest';

import { formatEventDayLabel, groupEventsByLocalDay } from './event-grouping';

// Anchor "now" to a deterministic Wednesday 2026-04-15 10:30 local time so the
// label helpers stay stable regardless of where the tests are run.
const now = new Date(2026, 3, 15, 10, 30);

const makeEvent = (startTime: string, id: string) => ({ id, startTime });

describe('formatEventDayLabel', () => {
  it('labels the current local day as "Today"', () => {
    expect(formatEventDayLabel(new Date(2026, 3, 15, 19, 0), now)).toBe('Today');
  });

  it('labels the next local day as "Tomorrow"', () => {
    expect(formatEventDayLabel(new Date(2026, 3, 16, 7, 0), now)).toBe('Tomorrow');
  });

  it('falls back to "Weekday, Month D" for later dates in the same year', () => {
    expect(formatEventDayLabel(new Date(2026, 3, 18, 9, 0), now)).toBe('Saturday, April 18');
  });

  it('includes the year when the event rolls into a different calendar year', () => {
    expect(formatEventDayLabel(new Date(2027, 0, 5, 9, 0), now)).toBe('Tuesday, January 5, 2027');
  });
});

describe('groupEventsByLocalDay', () => {
  it('returns an empty array when given no events', () => {
    expect(groupEventsByLocalDay([], now)).toEqual([]);
  });

  it('groups events happening on the same local day under one header', () => {
    const events = [
      makeEvent(new Date(2026, 3, 15, 8, 0).toISOString(), 'a'),
      makeEvent(new Date(2026, 3, 15, 18, 30).toISOString(), 'b'),
    ];

    const groups = groupEventsByLocalDay(events, now);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.label).toBe('Today');
    expect(groups[0]?.events.map((event) => event.id)).toEqual(['a', 'b']);
  });

  it('creates a new group when the local day changes, preserving order', () => {
    const events = [
      makeEvent(new Date(2026, 3, 15, 8, 0).toISOString(), 'today-early'),
      makeEvent(new Date(2026, 3, 16, 8, 0).toISOString(), 'tomorrow-early'),
      makeEvent(new Date(2026, 3, 18, 18, 0).toISOString(), 'saturday'),
    ];

    const groups = groupEventsByLocalDay(events, now);

    expect(groups.map((group) => group.label)).toEqual(['Today', 'Tomorrow', 'Saturday, April 18']);
    expect(groups.map((group) => group.events.length)).toEqual([1, 1, 1]);
  });

  it('exposes a stable day key usable as a React key', () => {
    const groups = groupEventsByLocalDay(
      [makeEvent(new Date(2026, 3, 18, 18, 0).toISOString(), 'weekend')],
      now,
    );

    expect(groups[0]?.dayKey).toBe('2026-04-18');
  });

  it('collapses same-day events into a single group even when the input is out of order', () => {
    // The feed is sorted by start time upstream, but the helper should never
    // emit two headers for the same local day. Late-arriving same-day events
    // fold back into their existing bucket, preserving first-seen order.
    const events = [
      makeEvent(new Date(2026, 3, 15, 8, 0).toISOString(), 'today-a'),
      makeEvent(new Date(2026, 3, 16, 8, 0).toISOString(), 'tomorrow'),
      makeEvent(new Date(2026, 3, 15, 20, 0).toISOString(), 'today-b'),
    ];

    const groups = groupEventsByLocalDay(events, now);

    expect(groups.map((group) => group.dayKey)).toEqual(['2026-04-15', '2026-04-16']);
    expect(groups[0]?.events.map((event) => event.id)).toEqual(['today-a', 'today-b']);
    expect(groups[1]?.events.map((event) => event.id)).toEqual(['tomorrow']);
  });
});
