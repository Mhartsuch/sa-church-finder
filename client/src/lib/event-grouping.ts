/**
 * Group an already-sorted list of events into day buckets using the browser's
 * local time zone, matching how the surrounding UI formats `startTime` with
 * `new Date(...)`. The helper is intentionally pure so it can be shared and
 * unit-tested without importing any React state.
 */

export interface EventWithStart {
  startTime: string;
}

export interface EventGroup<T extends EventWithStart> {
  /** YYYY-MM-DD in the browser's local time zone. Stable React key. */
  dayKey: string;
  /** Human-friendly label: "Today", "Tomorrow", or "Thursday, April 16". */
  label: string;
  events: T[];
}

const pad = (value: number): string => value.toString().padStart(2, '0');

const toLocalDayKey = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
};

/**
 * Render a display label for a given event day, relative to `now`.
 *
 * - Today / Tomorrow get special shortcuts so the most relevant rows are
 *   easy to spot while scanning.
 * - Everything else falls back to "Weekday, Month D" (e.g. "Thursday, April
 *   16"). We omit the year by default because the feed is dominated by
 *   near-future events; when the event rolls into a different year we add a
 *   trailing year to avoid ambiguity.
 */
export const formatEventDayLabel = (date: Date, now: Date = new Date()): string => {
  const dayKey = toLocalDayKey(date);
  const todayKey = toLocalDayKey(now);
  const tomorrowKey = toLocalDayKey(addDays(now, 1));

  if (dayKey === todayKey) return 'Today';
  if (dayKey === tomorrowKey) return 'Tomorrow';

  const includeYear = date.getFullYear() !== now.getFullYear();
  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    ...(includeYear ? { year: 'numeric' } : {}),
  });
  return formatter.format(date);
};

/**
 * Group events by their local-day key. Preserves the input order of events
 * within each group and the encounter order of groups themselves, which means
 * a feed already sorted by soonest-start stays sorted end-to-end.
 */
export const groupEventsByLocalDay = <T extends EventWithStart>(
  events: ReadonlyArray<T>,
  now: Date = new Date(),
): EventGroup<T>[] => {
  const groups: EventGroup<T>[] = [];
  const byKey = new Map<string, EventGroup<T>>();

  for (const event of events) {
    const date = new Date(event.startTime);
    const dayKey = toLocalDayKey(date);

    let group = byKey.get(dayKey);
    if (!group) {
      group = {
        dayKey,
        label: formatEventDayLabel(date, now),
        events: [],
      };
      byKey.set(dayKey, group);
      groups.push(group);
    }
    group.events.push(event);
  }

  return groups;
};
