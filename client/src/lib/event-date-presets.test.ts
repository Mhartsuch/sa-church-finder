import { describe, expect, it } from 'vitest';

import {
  EVENT_DATE_PRESETS,
  matchEventDatePreset,
  resolveEventDatePreset,
} from './event-date-presets';

// Anchor test "now" to a known weekday so every preset is deterministic.
// 2026-04-15 is a Wednesday (getDay() === 3).
const wednesday = new Date(2026, 3, 15, 10, 30);
// 2026-04-18 is a Saturday (getDay() === 6).
const saturday = new Date(2026, 3, 18, 10, 30);
// 2026-04-19 is a Sunday (getDay() === 0).
const sunday = new Date(2026, 3, 19, 10, 30);

describe('resolveEventDatePreset', () => {
  it('today resolves to a single-day range', () => {
    expect(resolveEventDatePreset('today', wednesday)).toEqual({
      from: '2026-04-15',
      to: '2026-04-15',
    });
  });

  it('this-week covers today through the upcoming Saturday', () => {
    expect(resolveEventDatePreset('this-week', wednesday)).toEqual({
      from: '2026-04-15',
      to: '2026-04-18',
    });
  });

  it('this-week on Saturday collapses to that single day', () => {
    expect(resolveEventDatePreset('this-week', saturday)).toEqual({
      from: '2026-04-18',
      to: '2026-04-18',
    });
  });

  it('this-sunday on a weekday jumps to the upcoming Sunday', () => {
    expect(resolveEventDatePreset('this-sunday', wednesday)).toEqual({
      from: '2026-04-19',
      to: '2026-04-19',
    });
  });

  it('this-sunday on Saturday resolves to the next day', () => {
    expect(resolveEventDatePreset('this-sunday', saturday)).toEqual({
      from: '2026-04-19',
      to: '2026-04-19',
    });
  });

  it('this-sunday on Sunday collapses to today', () => {
    expect(resolveEventDatePreset('this-sunday', sunday)).toEqual({
      from: '2026-04-19',
      to: '2026-04-19',
    });
  });

  it('this-weekend on a weekday jumps to the upcoming Sat-Sun', () => {
    expect(resolveEventDatePreset('this-weekend', wednesday)).toEqual({
      from: '2026-04-18',
      to: '2026-04-19',
    });
  });

  it('this-weekend on Saturday includes today and tomorrow', () => {
    expect(resolveEventDatePreset('this-weekend', saturday)).toEqual({
      from: '2026-04-18',
      to: '2026-04-19',
    });
  });

  it('this-weekend on Sunday is just today', () => {
    expect(resolveEventDatePreset('this-weekend', sunday)).toEqual({
      from: '2026-04-19',
      to: '2026-04-19',
    });
  });

  it('this-month covers today through the last calendar day of the month', () => {
    expect(resolveEventDatePreset('this-month', wednesday)).toEqual({
      from: '2026-04-15',
      to: '2026-04-30',
    });
  });

  it('this-month handles month boundaries', () => {
    const jan31 = new Date(2026, 0, 31, 8);
    expect(resolveEventDatePreset('this-month', jan31)).toEqual({
      from: '2026-01-31',
      to: '2026-01-31',
    });
  });

  it('next-30-days adds 30 calendar days to today', () => {
    expect(resolveEventDatePreset('next-30-days', wednesday)).toEqual({
      from: '2026-04-15',
      to: '2026-05-15',
    });
  });
});

describe('matchEventDatePreset', () => {
  it('identifies the active preset from a from/to pair', () => {
    const resolved = resolveEventDatePreset('this-week', wednesday);
    expect(matchEventDatePreset(resolved.from, resolved.to, wednesday)).toBe('this-week');
  });

  it('returns null when no preset matches', () => {
    expect(matchEventDatePreset('2026-04-15', '2026-04-17', wednesday)).toBeNull();
  });

  it('returns null when either value is missing', () => {
    expect(matchEventDatePreset('', '2026-04-15', wednesday)).toBeNull();
    expect(matchEventDatePreset('2026-04-15', '', wednesday)).toBeNull();
  });

  it('exposes every preset in display order', () => {
    const ids = EVENT_DATE_PRESETS.map((preset) => preset.id);
    expect(ids).toEqual([
      'today',
      'this-sunday',
      'this-weekend',
      'this-week',
      'this-month',
      'next-30-days',
    ]);
  });

  it('matches the this-sunday preset on a mid-week Wednesday', () => {
    const resolved = resolveEventDatePreset('this-sunday', wednesday);
    expect(matchEventDatePreset(resolved.from, resolved.to, wednesday)).toBe('this-sunday');
  });

  it('matches the this-sunday preset on a Saturday', () => {
    const resolved = resolveEventDatePreset('this-sunday', saturday);
    expect(matchEventDatePreset(resolved.from, resolved.to, saturday)).toBe('this-sunday');
  });
});
