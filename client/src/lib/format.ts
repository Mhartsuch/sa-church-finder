import { IChurchService, IChurchSummary } from '@/types/church';

export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/** "09:30" → "9:30 AM", "18:00" → "6 PM" */
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  if (Number.isNaN(hours)) return time;
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return minutes
    ? `${hour12}:${String(minutes).padStart(2, '0')} ${period}`
    : `${hour12} ${period}`;
};

/** Current day-of-week and minutes-past-midnight in San Antonio. */
const nowInSanAntonio = (now: Date): { day: number; minutes: number } => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
};

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

export interface INextService {
  service: IChurchService;
  /** "Today", "Tomorrow", or a weekday name */
  dayLabel: string;
}

/** The next upcoming service relative to `now` (San Antonio time), wrapping around the week. */
export const getNextService = (
  services: IChurchService[],
  now: Date = new Date(),
): INextService | null => {
  if (!services.length) return null;
  const { day, minutes } = nowInSanAntonio(now);
  let best: { service: IChurchService; offset: number } | null = null;

  for (const service of services) {
    let daysAhead = (service.dayOfWeek - day + 7) % 7;
    if (daysAhead === 0 && toMinutes(service.startTime) <= minutes) daysAhead = 7;
    const offset = daysAhead * 1440 + toMinutes(service.startTime);
    if (!best || offset < best.offset) best = { service, offset };
  }

  if (!best) return null;
  const daysAhead = Math.floor(best.offset / 1440);
  const dayLabel =
    daysAhead === 0
      ? 'Today'
      : daysAhead === 1
        ? 'Tomorrow'
        : (DAY_NAMES[best.service.dayOfWeek] ?? '');
  return { service: best.service, dayLabel };
};

export const formatNextService = (services: IChurchService[], now?: Date): string | null => {
  const next = getNextService(services, now);
  return next ? `${next.dayLabel} · ${formatTime(next.service.startTime)}` : null;
};

/** Prefer on-site reviews; fall back to the imported Google rating. */
export const getRating = (
  church: Pick<IChurchSummary, 'avgRating' | 'reviewCount' | 'googleRating' | 'googleReviewCount'>,
): { value: number; count: number } | null => {
  if (church.reviewCount > 0) return { value: church.avgRating, count: church.reviewCount };
  if (church.googleRating && church.googleReviewCount) {
    return { value: church.googleRating, count: church.googleReviewCount };
  }
  return null;
};

/** "4.7" stays "4.7"; "4.8667" becomes "4.87". */
export const formatRating = (value: number): string =>
  Number.isInteger(Math.round(value * 1000) / 100) ? value.toFixed(1) : value.toFixed(2);

export const plural = (count: number, word: string, pluralWord = `${word}s`): string =>
  `${count.toLocaleString()} ${count === 1 ? word : pluralWord}`;

export const churchCount = (count: number) => plural(count, 'church', 'churches');

export const churchSubtitle = (
  church: Pick<IChurchSummary, 'neighborhood' | 'denomination' | 'denominationFamily'>,
): string =>
  [church.neighborhood, church.denominationFamily ?? church.denomination]
    .filter(Boolean)
    .join(' · ');

export const directionsUrl = (church: Pick<IChurchSummary, 'address' | 'city' | 'state'>) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${church.address}, ${church.city}, ${church.state}`,
  )}`;

/** Photo list for a church, falling back to the cover image. */
export const churchPhotos = (
  church: Pick<IChurchSummary, 'photos' | 'coverImageUrl' | 'name'>,
): { url: string; alt: string }[] => {
  const photos = (church.photos ?? []).map((photo) => ({
    url: photo.url,
    alt: photo.altText || church.name,
  }));
  if (!photos.length && church.coverImageUrl) {
    photos.push({ url: church.coverImageUrl, alt: church.name });
  }
  return photos;
};
