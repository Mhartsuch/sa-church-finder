import { Link } from 'react-router-dom';
import {
  Accessibility,
  ArrowLeft,
  Baby,
  Check,
  Clock,
  Globe,
  Mail,
  MapPin,
  Phone,
  Scale,
  Star,
  Trash2,
  Users,
  X,
} from 'lucide-react';

import { useDocumentHead } from '@/hooks/useDocumentHead';

import { useCompareStore, MAX_COMPARE } from '@/stores/compare-store';
import { IChurchSummary, IChurchService } from '@/types/church';
import { formatDistance, formatRating, formatServiceTime, getDayName } from '@/utils/format';
const fallbackValue = '—';

/** Group services by day and sort Sun → Sat */
const formatServices = (services: IChurchService[]): string => {
  if (!services || services.length === 0) return fallbackValue;
  const grouped = new Map<number, string[]>();
  for (const s of services) {
    const times = grouped.get(s.dayOfWeek) ?? [];
    times.push(formatServiceTime(s.startTime));
    grouped.set(s.dayOfWeek, times);
  }
  return Array.from(grouped.entries())
    .sort(([a], [b]) => a - b)
    .map(([day, times]) => `${getDayName(day)} ${times.join(', ')}`)
    .join('\n');
};

const BoolCell = ({ value }: { value: boolean | null }) => {
  if (value === true) return <Check className="mx-auto h-5 w-5 text-green-600" />;
  if (value === false) return <X className="mx-auto h-5 w-5 text-muted-foreground/40" />;
  return <span className="text-muted-foreground">{fallbackValue}</span>;
};

const RatingCell = ({ church }: { church: IChurchSummary }) => {
  const rating = church.reviewCount > 0 ? church.avgRating : (church.googleRating ?? 0);
  const count = church.reviewCount > 0 ? church.reviewCount : (church.googleReviewCount ?? 0);
  if (rating === 0) return <span className="text-muted-foreground">{fallbackValue}</span>;
  return (
    <div className="flex items-center justify-center gap-1.5">
      <Star className="h-4 w-4 fill-[#fbbf24] text-[#fbbf24]" />
      <span className="font-semibold">{formatRating(rating)}</span>
      {count > 0 && <span className="text-muted-foreground">({count})</span>}
    </div>
  );
};

interface RowProps {
  label: string;
  icon?: React.ReactNode;
  churches: IChurchSummary[];
  render: (church: IChurchSummary) => React.ReactNode;
  whiteSpacePre?: boolean;
}

const CompareRow = ({ label, icon, churches, render, whiteSpacePre }: RowProps) => (
  <tr className="border-b border-border last:border-0">
    <th
      scope="row"
      className="sticky left-0 z-[1] bg-card px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground sm:px-6"
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
    </th>
    {churches.map((church) => (
      <td
        key={church.id}
        className={`px-4 py-3 text-center text-sm text-foreground sm:px-6 ${whiteSpacePre ? 'whitespace-pre-line' : ''}`}
      >
        {render(church)}
      </td>
    ))}
  </tr>
);

/** Mobile-friendly card for a single church in the compare view */
const CompareCard = ({
  church,
  onRemove,
}: {
  church: IChurchSummary;
  onRemove: (id: string) => void;
}) => {
  const rating = church.reviewCount > 0 ? church.avgRating : (church.googleRating ?? 0);
  const count = church.reviewCount > 0 ? church.reviewCount : (church.googleReviewCount ?? 0);
  const nextServiceText = formatServices(church.services);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-airbnb-subtle">
      {/* Photo + name header */}
      <div className="relative">
        <div className="aspect-[16/9] overflow-hidden bg-muted">
          {church.coverImageUrl ? (
            <img
              src={church.coverImageUrl}
              alt={church.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              No photo
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => onRemove(church.id)}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 shadow-sm transition-colors hover:bg-muted"
          aria-label={`Remove ${church.name}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <Link
            to={`/churches/${church.slug}`}
            className="text-base font-semibold text-foreground transition-colors hover:text-[#FF385C]"
          >
            {church.name}
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {church.denomination || 'Non-denominational'}
          </p>
        </div>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <Star className="h-4 w-4 fill-[#fbbf24] text-[#fbbf24]" />
            <span className="font-semibold">{formatRating(rating)}</span>
            {count > 0 && <span className="text-muted-foreground">({count})</span>}
          </div>
        )}

        {/* Details grid */}
        <dl className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-2 text-sm">
          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> Distance
          </dt>
          <dd>{formatDistance(church.distance)}</dd>

          {church.neighborhood && (
            <>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Area
              </dt>
              <dd>{church.neighborhood}</dd>
            </>
          )}

          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Services
          </dt>
          <dd className="whitespace-pre-line">{nextServiceText}</dd>

          {church.languages.length > 0 && (
            <>
              <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Globe className="h-3.5 w-3.5" /> Languages
              </dt>
              <dd>{church.languages.join(', ')}</dd>
            </>
          )}

          {church.phone && (
            <>
              <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Phone className="h-3.5 w-3.5" /> Phone
              </dt>
              <dd>
                <a href={`tel:${church.phone}`} className="text-[#FF385C] hover:underline">
                  {church.phone}
                </a>
              </dd>
            </>
          )}
        </dl>

        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5">
          {church.wheelchairAccessible && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
              <Accessibility className="h-3 w-3" /> Accessible
            </span>
          )}
          {church.goodForChildren && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
              <Baby className="h-3 w-3" /> Family
            </span>
          )}
          {church.goodForGroups && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
              <Users className="h-3 w-3" /> Groups
            </span>
          )}
          {church.isClaimed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
              <Check className="h-3 w-3" /> Verified
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const ComparePage = () => {
  useDocumentHead({
    title: 'Compare Churches',
    description:
      'Compare San Antonio churches side by side — service times, ratings, amenities, and more.',
    canonicalPath: '/compare',
    noindex: true,
  });

  const selectedChurches = useCompareStore((state) => state.selectedChurches);
  const clearChurches = useCompareStore((state) => state.clearChurches);
  const removeChurch = useCompareStore((state) => state.removeChurch);

  if (selectedChurches.length === 0) {
    return (
      <main className="flex flex-1 items-center justify-center bg-background px-4 py-16 sm:px-6 lg:px-10 xl:px-12">
        <div className="w-full max-w-[560px] rounded-[28px] border border-border bg-card px-8 py-12 text-center shadow-[0_16px_48px_rgba(0,0,0,0.08)]">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted text-foreground">
            <Scale className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold text-foreground">No churches selected yet</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Add up to {MAX_COMPARE} churches from the search results to compare their details side
            by side.
          </p>
          <Link
            to="/search"
            className="mt-8 inline-flex items-center gap-2 rounded-[12px] border border-foreground bg-foreground px-5 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse churches
          </Link>
        </div>
      </main>
    );
  }

  // Clamp to MAX_COMPARE to keep the table usable
  const churches = selectedChurches.slice(0, MAX_COMPARE);

  return (
    <main className="flex-1 bg-background px-4 py-10 sm:px-6 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to search
            </Link>
            <h1 className="mt-3 text-2xl font-semibold text-foreground">Compare churches</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {churches.length} of {MAX_COMPARE} slots used
            </p>
          </div>
          <button
            type="button"
            onClick={clearChurches}
            className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground"
          >
            <Trash2 className="h-4 w-4" />
            Clear all
          </button>
        </div>

        {/* Mobile: stacked card view */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:hidden">
          {churches.map((church) => (
            <CompareCard key={church.id} church={church} onRemove={removeChurch} />
          ))}
        </div>

        {/* Desktop: comparison table */}
        <div className="mt-8 hidden overflow-x-auto rounded-[20px] border border-border bg-card shadow-[0_12px_40px_rgba(0,0,0,0.06)] md:block">
          <table className="w-full min-w-[600px] table-fixed border-collapse">
            <colgroup>
              <col className="w-[160px] sm:w-[200px]" />
              {churches.map((c) => (
                <col key={c.id} />
              ))}
            </colgroup>

            {/* Church header row: image + name */}
            <thead>
              <tr className="border-b border-border">
                <th className="sticky left-0 z-[1] bg-card p-4 sm:p-6" />
                {churches.map((church) => (
                  <th key={church.id} className="p-4 text-center align-top sm:p-6">
                    <div className="relative mx-auto w-full max-w-[220px]">
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeChurch(church.id)}
                        className="absolute -right-2 -top-2 z-[2] flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:border-foreground hover:bg-muted"
                        aria-label={`Remove ${church.name}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>

                      {/* Photo */}
                      <div className="aspect-[4/3] overflow-hidden rounded-[12px] bg-muted">
                        {church.coverImageUrl ? (
                          <img
                            src={church.coverImageUrl}
                            alt={church.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                            No photo
                          </div>
                        )}
                      </div>

                      {/* Name + link */}
                      <Link
                        to={`/churches/${church.slug}`}
                        className="mt-3 block text-sm font-semibold text-foreground transition-colors hover:text-[#FF385C]"
                      >
                        {church.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {church.denomination || 'Non-denominational'}
                      </p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Rating */}
              <CompareRow
                label="Rating"
                icon={<Star className="h-3.5 w-3.5" />}
                churches={churches}
                render={(c) => <RatingCell church={c} />}
              />

              {/* Distance */}
              <CompareRow
                label="Distance"
                icon={<MapPin className="h-3.5 w-3.5" />}
                churches={churches}
                render={(c) => formatDistance(c.distance)}
              />

              {/* Neighborhood */}
              <CompareRow
                label="Neighborhood"
                churches={churches}
                render={(c) => c.neighborhood || fallbackValue}
              />

              {/* Services */}
              <CompareRow
                label="Services"
                icon={<Clock className="h-3.5 w-3.5" />}
                churches={churches}
                render={(c) => formatServices(c.services)}
                whiteSpacePre
              />

              {/* Languages */}
              <CompareRow
                label="Languages"
                icon={<Globe className="h-3.5 w-3.5" />}
                churches={churches}
                render={(c) => (c.languages.length > 0 ? c.languages.join(', ') : fallbackValue)}
              />

              {/* Amenities */}
              <CompareRow
                label="Amenities"
                churches={churches}
                render={(c) =>
                  c.amenities.length > 0 ? (
                    <span className="text-left">
                      {c.amenities.map((a) => (
                        <span
                          key={a}
                          className="mb-1 mr-1 inline-block rounded-full bg-muted px-2 py-0.5 text-xs"
                        >
                          {a}
                        </span>
                      ))}
                    </span>
                  ) : (
                    fallbackValue
                  )
                }
              />

              {/* Wheelchair Accessible */}
              <CompareRow
                label="Wheelchair"
                icon={<Accessibility className="h-3.5 w-3.5" />}
                churches={churches}
                render={(c) => <BoolCell value={c.wheelchairAccessible} />}
              />

              {/* Family Friendly */}
              <CompareRow
                label="Family Friendly"
                icon={<Baby className="h-3.5 w-3.5" />}
                churches={churches}
                render={(c) => <BoolCell value={c.goodForChildren} />}
              />

              {/* Good for Groups */}
              <CompareRow
                label="Good for Groups"
                icon={<Users className="h-3.5 w-3.5" />}
                churches={churches}
                render={(c) => <BoolCell value={c.goodForGroups} />}
              />

              {/* Contact */}
              <CompareRow
                label="Phone"
                icon={<Phone className="h-3.5 w-3.5" />}
                churches={churches}
                render={(c) =>
                  c.phone ? (
                    <a href={`tel:${c.phone}`} className="text-[#FF385C] hover:underline">
                      {c.phone}
                    </a>
                  ) : (
                    fallbackValue
                  )
                }
              />

              <CompareRow
                label="Email"
                icon={<Mail className="h-3.5 w-3.5" />}
                churches={churches}
                render={(c) =>
                  c.email ? (
                    <a
                      href={`mailto:${c.email}`}
                      className="break-all text-[#FF385C] hover:underline"
                    >
                      {c.email}
                    </a>
                  ) : (
                    fallbackValue
                  )
                }
              />

              {/* Address */}
              <CompareRow
                label="Address"
                icon={<MapPin className="h-3.5 w-3.5" />}
                churches={churches}
                render={(c) => (
                  <span className="whitespace-pre-line text-xs">
                    {c.address}
                    {'\n'}
                    {c.city}, {c.state} {c.zipCode}
                  </span>
                )}
              />

              {/* Verified / Claimed */}
              <CompareRow
                label="Verified"
                churches={churches}
                render={(c) =>
                  c.isClaimed ? (
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <Check className="h-4 w-4" /> Claimed
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Unclaimed</span>
                  )
                }
              />
            </tbody>
          </table>
        </div>

        {/* Add more CTA when under limit */}
        {selectedChurches.length < MAX_COMPARE && (
          <div className="mt-6 text-center">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-[12px] border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground"
            >
              <Scale className="h-4 w-4" />
              Add more churches ({MAX_COMPARE - selectedChurches.length} slots remaining)
            </Link>
          </div>
        )}
      </div>
    </main>
  );
};

export default ComparePage;
