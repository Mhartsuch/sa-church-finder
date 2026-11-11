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

const NON_WORSHIP =
  /bible|study|estudio|school|escuela|class|clase|college|catech|youth|j[oó]venes|student|child|ni[nñ]os|kids|nursery|atrium|prayer|oraci[oó]n|confession|reconciliation|adoration|rosary|rosario|fellowship|formation|discipleship|training|rehearsal|choir|young adults|small group|life group|men's|women's|recovery|office|vespers|matins|evensong|meeting(?! for worship)/i;

/** Whether a listed gathering is a worship service, as opposed to a class or prayer group. */
export const isWorshipService = (service: IChurchService): boolean =>
  !NON_WORSHIP.test(service.serviceType);

/**
 * The next upcoming worship service relative to `now` (San Antonio time),
 * wrapping around the week. Classes and prayer groups only count when the
 * church lists no worship service at all.
 */
export const getNextService = (
  services: IChurchService[],
  now: Date = new Date(),
): INextService | null => {
  if (!services.length) return null;
  const worship = services.filter(isWorshipService);
  if (worship.length) services = worship;
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

/** Display names for denomination families whose stored value is jargon. */
const FAMILY_LABELS: Record<string, string> = {
  'Restoration Movement': 'Church of Christ',
  Other: 'Other traditions',
};

export const familyLabel = (family: string): string => FAMILY_LABELS[family] ?? family;

export const churchSubtitle = (
  church: Pick<IChurchSummary, 'neighborhood' | 'denomination' | 'denominationFamily'>,
): string => {
  const family =
    church.denominationFamily && church.denominationFamily !== 'Other'
      ? familyLabel(church.denominationFamily)
      : church.denomination;
  return [church.neighborhood, family].filter(Boolean).join(' · ');
};

/** Denomination labels that already name a body of people and read badly before "church". */
const SELF_DESCRIBING = /church|assembl|witnesses|army|saints|chapel|quaker|unity|science/i;

/** "Catholic church", "Church of Christ congregation", "Christian church". */
export const churchKind = (
  church: Pick<IChurchSummary, 'denomination' | 'denominationFamily'>,
): string => {
  const label = church.denomination ?? church.denominationFamily;
  if (!label || label === 'Other') return 'Christian church';
  return SELF_DESCRIBING.test(label) ? `${label} congregation` : `${label} church`;
};

/** "West Side, San Antonio, TX" — or just "Windcrest, TX" when the area is the city. */
export const churchLocation = (
  church: Pick<IChurchSummary, 'neighborhood' | 'city' | 'state'>,
): string =>
  [church.neighborhood === church.city ? null : church.neighborhood, church.city, church.state]
    .filter(Boolean)
    .join(', ');

type AddressParts = Pick<IChurchSummary, 'address' | 'city' | 'state' | 'zipCode'>;

/**
 * The street line of a church's address. Imported addresses are full postal
 * addresses ("1321 El Paso St, San Antonio, TX 78207, USA"); hand-entered
 * ones are just the street.
 */
export const streetAddress = (church: AddressParts): string => {
  const [street, ...rest] = church.address.split(',').map((part) => part.trim());
  // No comma, or a comma that is part of the street itself ("Suite 4, Bldg B").
  const isFullAddress = rest.some(
    (part) => part.toLowerCase() === church.city.toLowerCase() || part.includes(church.zipCode),
  );
  return isFullAddress ? street : church.address.trim();
};

/** "1321 El Paso St, San Antonio, TX 78207" — each part exactly once. */
export const formatAddress = (church: AddressParts): string =>
  `${streetAddress(church)}, ${church.city}, ${church.state} ${church.zipCode}`.trim();

export const directionsUrl = (church: AddressParts) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(formatAddress(church))}`;

/** "English", "English and Spanish", "English, Korean, and Spanish". */
export const formatList = (items: string[]): string => {
  if (items.length <= 2) return items.join(' and ');
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
};

/** A gathering's name as shown on the profile; the generic import label reads as worship. */
export const serviceLabel = (service: Pick<IChurchService, 'serviceType'>): string =>
  service.serviceType.trim().toLowerCase() === 'service' ? 'Worship service' : service.serviceType;

/**
 * "Mass · Spanish", "Worship service" — the gathering's name plus its
 * language, unless the name already says it ("Spanish Service").
 */
export const serviceCaption = (
  service: Pick<IChurchService, 'serviceType' | 'language'>,
): string => {
  const label = serviceLabel(service);
  const language = service.language?.trim();
  if (!language || language === 'English') return label;
  const stem = language.toLowerCase().slice(0, 5); // "spani" also matches "Español"-free labels
  return label.toLowerCase().includes(stem) ? label : `${label} · ${language}`;
};

export const CONTACT_EMAIL = 'admin@sachurchfinder.com';

/** Pre-addressed email for telling us a listing is wrong. */
export const correctionUrl = (church: Pick<IChurchSummary, 'name' | 'slug'>): string =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Correction for ${church.name}`)}&body=${encodeURIComponent(
    `Listing: https://sachurchfinder.com/churches/${church.slug}\n\nWhat needs fixing:\n`,
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
