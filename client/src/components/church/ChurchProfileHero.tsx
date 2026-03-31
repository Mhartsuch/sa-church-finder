import { ExternalLink, Globe, MapPin } from 'lucide-react';

import { getChurchMonogram, getChurchVisualTheme } from '@/lib/church-visuals';
import { IChurch, IChurchService } from '@/types/church';
import { formatServiceTime, getDayName } from '@/utils/format';

interface ChurchProfileHeroProps {
  church: IChurch;
  directionsUrl: string;
}

const DAY_ORDER = [0, 1, 2, 3, 4, 5, 6];

const groupServicesByDay = (services: IChurchService[]) => {
  const grouped = new Map<number, IChurchService[]>();

  for (const service of services) {
    const existing = grouped.get(service.dayOfWeek) || [];
    existing.push(service);
    grouped.set(service.dayOfWeek, existing);
  }

  return DAY_ORDER.filter((day) => grouped.has(day)).map((day) => ({
    day,
    dayName: getDayName(day),
    services: grouped.get(day) ?? [],
  }));
};

const buildWebsiteUrl = (website: string | null) => {
  if (!website) {
    return null;
  }

  return website.startsWith('http') ? website : `https://${website}`;
};

const formatServiceWindow = (service: IChurchService) => {
  if (!service.endTime) {
    return formatServiceTime(service.startTime);
  }

  return `${formatServiceTime(service.startTime)} - ${formatServiceTime(service.endTime)}`;
};

export const ChurchProfileHero = ({ church, directionsUrl }: ChurchProfileHeroProps) => {
  const churchTheme = getChurchVisualTheme(church);
  const churchMonogram = getChurchMonogram(church.name);
  const groupedServices = groupServicesByDay(church.services);
  const websiteUrl = buildWebsiteUrl(church.website);
  const languageChips = church.languages.length > 0 ? church.languages : ['English'];
  const amenityChips = church.amenities.slice(0, 3);
  const serviceWindowCount = church.services.length;
  const serviceDayCount = groupedServices.length;
  const locationLabel = church.neighborhood || `${church.city}, ${church.state}`;

  return (
    <div className="mx-auto mb-6 max-w-[1180px] px-6 lg:px-0">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="relative min-h-[340px] overflow-hidden rounded-[32px] bg-[#e9dcc8] lg:min-h-[420px]">
          {church.coverImageUrl ? (
            <>
              <img
                src={church.coverImageUrl}
                alt={`${church.name} cover`}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(17,24,39,0.18),rgba(17,24,39,0.72))]" />
            </>
          ) : (
            <>
              <div className={`absolute inset-0 bg-gradient-to-br ${churchTheme.surfaceClass}`} />
              <div className={`absolute inset-0 ${churchTheme.glowClass}`} />
              <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(0,0,0,0.04),rgba(0,0,0,0.3))]" />
            </>
          )}

          <div className="absolute right-5 top-5 flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/25 bg-white/12 text-lg font-semibold tracking-[0.24em] text-white backdrop-blur-sm">
            {churchMonogram}
          </div>

          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm ${churchTheme.outlineClass}`}
            >
              {church.denomination || 'San Antonio church'}
            </span>

            <div className="mt-4 max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">
                {locationLabel}
              </p>
              <p className="mt-1 text-[30px] font-semibold leading-[1.05]">{church.name}</p>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
                {church.description ||
                  'A San Antonio church profile with current service details, location context, and helpful planning info for your next visit.'}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {church.yearEstablished ? (
                <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-medium text-white/88 backdrop-blur-sm">
                  Established {church.yearEstablished}
                </span>
              ) : null}
              {church.denominationFamily ? (
                <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-medium text-white/88 backdrop-blur-sm">
                  {church.denominationFamily}
                </span>
              ) : null}
              {serviceWindowCount > 0 ? (
                <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-medium text-white/88 backdrop-blur-sm">
                  {serviceWindowCount} weekly service{serviceWindowCount === 1 ? '' : 's'}
                </span>
              ) : null}
            </div>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <section className="rounded-[28px] border border-[#e9ded0] bg-[#fff9f3] p-5 shadow-[0_12px_30px_rgba(95,76,52,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b7355]">
              Visit Snapshot
            </p>
            <h2 className="mt-3 text-[20px] font-semibold leading-[1.15] text-[#2f241b]">
              {locationLabel}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#5f5142]">
              {church.address}, {church.city}, {church.state} {church.zipCode}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#efe2d3] px-3 py-1 text-xs font-medium text-[#5f4630]">
                {church.denomination || 'Christian church'}
              </span>
              {church.avgRating > 0 ? (
                <span className="rounded-full bg-[#efe2d3] px-3 py-1 text-xs font-medium text-[#5f4630]">
                  {church.avgRating.toFixed(1)} rating
                </span>
              ) : null}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#dde6e0] bg-[#f6fbf7] p-5 shadow-[0_12px_30px_rgba(42,80,59,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5f7d68]">
              Weekly Rhythm
            </p>
            <p className="mt-3 text-sm leading-6 text-[#3c5144]">
              {serviceWindowCount > 0
                ? `${serviceWindowCount} service window${serviceWindowCount === 1 ? '' : 's'} across ${serviceDayCount} day${serviceDayCount === 1 ? '' : 's'} each week.`
                : 'Service times are still being confirmed for this profile.'}
            </p>
            <div className="mt-4 space-y-3">
              {groupedServices.slice(0, 2).map((group) => (
                <div
                  key={group.day}
                  className="rounded-2xl border border-[#d4e4d9] bg-white/70 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-[#244332]">{group.dayName}</p>
                  <p className="mt-1 text-sm text-[#587062]">
                    {group.services.slice(0, 2).map(formatServiceWindow).join(' and ')}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#e2dff1] bg-[#faf8ff] p-5 shadow-[0_12px_30px_rgba(71,61,119,0.07)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#70628e]">
              Languages And Access
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {languageChips.map((language) => (
                <span
                  key={language}
                  className="rounded-full bg-[#ece8fa] px-3 py-1 text-xs font-medium text-[#564a73]"
                >
                  {language}
                </span>
              ))}
              {amenityChips.map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-full border border-[#ddd7f2] px-3 py-1 text-xs font-medium text-[#5b5470]"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#e7d8cd] bg-[#fff8f0] p-5 shadow-[0_12px_30px_rgba(111,78,48,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a6848]">
              Plan Your Visit
            </p>
            <p className="mt-3 text-sm leading-6 text-[#624b35]">
              Use the church website for current photos, ministry details, and the latest arrival
              guidance.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {websiteUrl ? (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between rounded-2xl bg-[#2f241b] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#211913]"
                >
                  <span className="inline-flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Visit website
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between rounded-2xl border border-[#d8c2ad] bg-white px-4 py-3 text-sm font-semibold text-[#3f3125] transition-colors hover:bg-[#f9f1e8]"
              >
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Get directions
                </span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
