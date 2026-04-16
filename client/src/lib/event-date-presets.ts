/**
 * Pure helpers for the "quick date preset" buttons on the Events Discovery
 * page. Each preset resolves to a `{ from, to }` pair of YYYY-MM-DD strings
 * that match what the page stores in its URL (the search params use a date
 * input format, not full ISO timestamps).
 *
 * Weeks are treated as Sunday → Saturday, matching the convention used by
 * US-facing church calendars. "This weekend" means the next upcoming
 * Saturday/Sunday pair — if today is already Sat/Sun it stays within the
 * current weekend.
 */

export type EventDatePresetId =
  | 'today'
  | 'this-sunday'
  | 'this-weekend'
  | 'this-week'
  | 'this-month'
  | 'next-30-days';

export interface EventDatePreset {
  id: EventDatePresetId;
  label: string;
  from: string;
  to: string;
}

const pad = (value: number): string => value.toString().padStart(2, '0');

const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number): Date => {
  const next = startOfDay(date);
  next.setDate(next.getDate() + days);
  return next;
};

const endOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth() + 1, 0);

/**
 * Resolve the YYYY-MM-DD pair for a given preset, relative to `now`. All
 * arithmetic happens in the caller's local time zone so the resulting
 * strings line up with a `<input type="date">` value on the same device.
 */
export const resolveEventDatePreset = (
  id: EventDatePresetId,
  now: Date = new Date(),
): { from: string; to: string } => {
  const today = startOfDay(now);
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

  switch (id) {
    case 'today': {
      const key = toDateKey(today);
      return { from: key, to: key };
    }

    case 'this-sunday': {
      // If today is Sunday, use today. Otherwise jump to the upcoming Sunday.
      // Churches in San Antonio concentrate primary services on Sundays, so
      // visitors frequently plan their first visit specifically around
      // "this Sunday" rather than the broader weekend window.
      if (dayOfWeek === 0) {
        const key = toDateKey(today);
        return { from: key, to: key };
      }
      const daysUntilSunday = 7 - dayOfWeek;
      const sundayKey = toDateKey(addDays(today, daysUntilSunday));
      return { from: sundayKey, to: sundayKey };
    }

    case 'this-weekend': {
      if (dayOfWeek === 6) {
        // Saturday: weekend runs through tomorrow (Sunday)
        return { from: toDateKey(today), to: toDateKey(addDays(today, 1)) };
      }
      if (dayOfWeek === 0) {
        // Sunday: weekend ends today
        return { from: toDateKey(today), to: toDateKey(today) };
      }
      // Weekday: jump to the upcoming Saturday, include Sunday
      const daysUntilSaturday = 6 - dayOfWeek;
      const saturday = addDays(today, daysUntilSaturday);
      const sunday = addDays(saturday, 1);
      return { from: toDateKey(saturday), to: toDateKey(sunday) };
    }

    case 'this-week': {
      // Week ends on the upcoming Saturday (inclusive). Sunday is day 0.
      const daysUntilEnd = 6 - dayOfWeek;
      const end = addDays(today, daysUntilEnd);
      return { from: toDateKey(today), to: toDateKey(end) };
    }

    case 'this-month': {
      const end = endOfMonth(today);
      return { from: toDateKey(today), to: toDateKey(end) };
    }

    case 'next-30-days': {
      const end = addDays(today, 30);
      return { from: toDateKey(today), to: toDateKey(end) };
    }

    default: {
      const exhaustiveCheck: never = id;
      throw new Error(`Unknown event date preset: ${exhaustiveCheck as string}`);
    }
  }
};

export const EVENT_DATE_PRESETS: ReadonlyArray<{
  id: EventDatePresetId;
  label: string;
}> = [
  { id: 'today', label: 'Today' },
  { id: 'this-sunday', label: 'This Sunday' },
  { id: 'this-weekend', label: 'This weekend' },
  { id: 'this-week', label: 'This week' },
  { id: 'this-month', label: 'This month' },
  { id: 'next-30-days', label: 'Next 30 days' },
];

/**
 * Return the preset id whose `{ from, to }` matches the supplied values, or
 * `null` if nothing matches. Useful for highlighting the currently-active
 * preset chip based on URL state.
 */
export const matchEventDatePreset = (
  fromDate: string,
  toDate: string,
  now: Date = new Date(),
): EventDatePresetId | null => {
  if (!fromDate || !toDate) return null;
  for (const preset of EVENT_DATE_PRESETS) {
    const resolved = resolveEventDatePreset(preset.id, now);
    if (resolved.from === fromDate && resolved.to === toDate) {
      return preset.id;
    }
  }
  return null;
};
