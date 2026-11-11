import {
  Accessibility,
  Baby,
  CalendarDays,
  Check,
  Globe,
  Languages,
  MapPin,
  Navigation,
  Mail,
  Phone,
  Share,
  Star,
  Users,
} from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { HeartButton } from '@/components/church/HeartButton';
import { PhotoMosaic } from '@/components/church/PhotoMosaic';
import { ReviewSection } from '@/components/reviews/ReviewSection';
import { cn } from '@/lib/utils';
import { useChurch } from '@/hooks/useChurches';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  churchKind,
  churchLocation,
  churchPhotos,
  correctionUrl,
  DAY_NAMES,
  directionsUrl,
  formatAddress,
  formatList,
  formatRating,
  formatTime,
  getNextService,
  getRating,
  plural,
  serviceCaption,
  streetAddress,
} from '@/lib/format';
import { IChurch } from '@/types/church';

const ChurchPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: church, isPending, isError } = useChurch(slug);

  useDocumentTitle(
    church?.name,
    church
      ? `${church.name} in ${church.neighborhood ?? 'San Antonio'} — service times, photos, and reviews.`
      : undefined,
  );
  useChurchJsonLd(church);

  if (isPending) return <ProfileSkeleton />;
  if (isError || !church) {
    return (
      <div className="mx-auto max-w-lg px-6 py-32 text-center">
        <h1 className="text-3xl font-semibold">We can’t find that church</h1>
        <p className="mt-3 text-gray-500">It may have moved or closed.</p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white"
        >
          Browse churches
        </Link>
      </div>
    );
  }

  const rating = getRating(church);
  const location = churchLocation(church);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold leading-tight">{church.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm">
            {rating && (
              <>
                <span className="flex items-center gap-1 font-semibold">
                  <Star className="h-3.5 w-3.5 fill-current" /> {formatRating(rating.value)}
                </span>
                <span>·</span>
                <a href="#reviews" className="font-semibold underline">
                  {plural(rating.count, 'review')}
                </a>
                <span>·</span>
              </>
            )}
            <span className="font-semibold underline">{location}</span>
          </p>
        </div>
        <div className="flex gap-1">
          <ShareButton name={church.name} />
          <HeartButton
            churchId={church.id}
            churchName={church.name}
            saved={church.isSaved}
            variant="inline"
          />
        </div>
      </div>

      <div className="mt-6">
        <PhotoMosaic photos={churchPhotos(church)} name={church.name} />
      </div>

      <div className="mt-10 grid gap-16 md:grid-cols-[1fr_360px]">
        <div className="divide-y divide-gray-200">
          <section className="pb-8">
            <h2 className="text-[22px] font-semibold">
              {churchKind(church)} in {church.neighborhood ?? 'San Antonio'}
            </h2>
            <p className="mt-1 text-gray-600">
              {[
                church.pastorName && `Led by ${church.pastorName}`,
                church.yearEstablished && `Est. ${church.yearEstablished}`,
                church.languages.length > 0 && church.languages.join(' · '),
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </section>

          <Highlights church={church} />

          {church.description && <About text={church.description} />}

          <Services church={church} />

          {/* Desktop shows these in the sticky visit card. */}
          {(church.website || church.phone || church.email) && (
            <section className="py-8 md:hidden">
              <h2 className="text-[22px] font-semibold">Get in touch</h2>
              <ContactLinks church={church} className="mt-4" />
            </section>
          )}

          <Offers church={church} />

          <ReviewSection church={church} />

          <LocationSection church={church} />
        </div>

        <aside className="hidden md:block">
          <VisitCard church={church} />
        </aside>
      </div>

      <MobileVisitBar church={church} />
    </main>
  );
};

const Highlights = ({ church }: { church: IChurch }) => {
  const items: { icon: ReactNode; title: string; body: string }[] = [];
  if (church.goodForChildren) {
    items.push({
      icon: <Baby className="h-6 w-6" />,
      title: 'Great for kids',
      body: 'Families say this church welcomes children.',
    });
  }
  if (church.wheelchairAccessible) {
    items.push({
      icon: <Accessibility className="h-6 w-6" />,
      title: 'Wheelchair accessible',
      body: 'Accessible entrance for every guest.',
    });
  }
  if (church.languages.length > 1) {
    items.push({
      icon: <Languages className="h-6 w-6" />,
      title: 'Multilingual worship',
      body: `Services in ${formatList(church.languages)}.`,
    });
  }
  if (church.goodForGroups) {
    items.push({
      icon: <Users className="h-6 w-6" />,
      title: 'Good for groups',
      body: 'Bring friends or your small group.',
    });
  }
  if (!items.length) return null;
  return (
    <section className="space-y-6 py-8">
      {items.slice(0, 3).map((item) => (
        <div key={item.title} className="flex gap-6">
          <span className="text-gray-800">{item.icon}</span>
          <div>
            <p className="font-semibold">{item.title}</p>
            <p className="text-sm text-gray-500">{item.body}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

const About = ({ text }: { text: string }) => {
  const [expanded, setExpanded] = useState(false);
  const long = text.length > 420;
  return (
    <section className="py-8">
      <h2 className="text-[22px] font-semibold">About this church</h2>
      <p className="mt-4 whitespace-pre-line leading-relaxed text-gray-800">
        {long && !expanded ? `${text.slice(0, 420).trimEnd()}…` : text}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 font-semibold underline"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </section>
  );
};

const Services = ({ church }: { church: IChurch }) => {
  if (!church.services.length) {
    return (
      <section className="py-8">
        <h2 className="text-[22px] font-semibold">Service times</h2>
        <p className="mt-3 text-gray-600">
          Service times aren’t listed yet.{' '}
          {church.website
            ? 'Check the church website before you visit.'
            : church.phone
              ? 'Call ahead before you visit.'
              : 'Stop by on a Sunday morning, or ask a neighbor who attends.'}{' '}
          Know when this church meets?{' '}
          <a href={correctionUrl(church)} className="font-medium text-gray-800 underline">
            Share the times with us
          </a>
          .
        </p>
      </section>
    );
  }
  const byDay = DAY_NAMES.map((day, index) => ({
    day,
    services: church.services.filter((service) => service.dayOfWeek === index),
  })).filter((group) => group.services.length);

  return (
    <section className="py-8">
      <h2 className="text-[22px] font-semibold">Service times</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {byDay.map((group) => (
          <div key={group.day} className="rounded-xl border border-gray-300 p-5">
            <p className="flex items-center gap-2 font-semibold">
              <CalendarDays className="h-4 w-4" /> {group.day}
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {group.services.map((service) => (
                <li key={service.id} className="flex justify-between gap-3">
                  <span className="font-medium">
                    {formatTime(service.startTime)}
                    {service.endTime && ` – ${formatTime(service.endTime)}`}
                  </span>
                  <span className="text-right text-gray-500">{serviceCaption(service)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-500">
        Times come from the church’s own website and can change, especially around holidays —
        confirm with the church before your first visit.{' '}
        <a href={correctionUrl(church)} className="font-medium text-gray-700 underline">
          Report a correction
        </a>
      </p>
    </section>
  );
};

const Offers = ({ church }: { church: IChurch }) => {
  const [showAll, setShowAll] = useState(false);
  if (!church.amenities.length) return null;
  const visible = showAll ? church.amenities : church.amenities.slice(0, 10);
  return (
    <section className="py-8">
      <h2 className="text-[22px] font-semibold">What this church offers</h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {visible.map((amenity) => (
          <li key={amenity} className="flex items-center gap-4">
            <Check className="h-5 w-5 text-gray-700" /> {amenity}
          </li>
        ))}
      </ul>
      {church.amenities.length > 10 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-8 rounded-lg border border-gray-900 px-6 py-3 font-semibold hover:bg-gray-50"
        >
          {showAll ? 'Show less' : `Show all ${church.amenities.length} offerings`}
        </button>
      )}
    </section>
  );
};

const LocationSection = ({ church }: { church: IChurch }) => {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  const pin = `${church.longitude},${church.latitude}`;
  const staticMap = token
    ? `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/pin-l+ff385c(${pin})/${pin},14/1000x480@2x?access_token=${token}`
    : null;
  return (
    <section className="py-12">
      <h2 className="text-[22px] font-semibold">Where you’ll worship</h2>
      <p className="mt-2 text-gray-600">{formatAddress(church)}</p>
      <a
        href={directionsUrl(church)}
        target="_blank"
        rel="noreferrer"
        className="mt-6 block overflow-hidden rounded-2xl"
      >
        {staticMap ? (
          <img
            src={staticMap}
            alt={`Map showing ${church.name}`}
            loading="lazy"
            className="aspect-[2/1] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[2/1] items-center justify-center bg-stone-100 text-gray-500">
            <MapPin className="mr-2 h-5 w-5" /> Open in Google Maps
          </div>
        )}
      </a>
    </section>
  );
};

const VisitCard = ({ church }: { church: IChurch }) => {
  const next = getNextService(church.services);
  const rating = getRating(church);
  return (
    <div className="sticky top-28 rounded-2xl border border-gray-200 p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
      <div className="flex items-baseline justify-between gap-3">
        {next ? (
          <p>
            <span className="text-[22px] font-semibold">{formatTime(next.service.startTime)}</span>{' '}
            <span className="text-gray-600">
              {next.dayLabel.toLowerCase() === 'today' ? 'today' : next.dayLabel}
            </span>
          </p>
        ) : (
          <p className="text-lg font-semibold">Plan your visit</p>
        )}
        {rating && (
          <span className="flex items-center gap-1 text-sm">
            <Star className="h-3 w-3 fill-current" /> {formatRating(rating.value)}
          </span>
        )}
      </div>
      {next && (
        <p className="text-sm text-gray-500">
          Next service
          {next.service.serviceType.toLowerCase() !== 'service' && ` · ${next.service.serviceType}`}
        </p>
      )}

      <a
        href={directionsUrl(church)}
        target="_blank"
        rel="noreferrer"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-gradient py-3.5 font-semibold text-white"
      >
        <Navigation className="h-4 w-4" /> Get directions
      </a>
      <ContactLinks church={church} className="mt-3" />
      <p className="mt-4 text-center text-sm text-gray-500">
        Everyone is welcome. No reservation needed.
      </p>
    </div>
  );
};

/** Website and phone buttons. Only http(s) websites are linked. */
const ContactLinks = ({ church, className }: { church: IChurch; className?: string }) => {
  const website = church.website && /^https?:\/\//i.test(church.website) ? church.website : null;
  const email =
    church.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(church.email) ? church.email : null;
  if (!website && !church.phone && !email) return null;
  return (
    <div className={cn('space-y-2', className)}>
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-900 py-3 font-semibold hover:bg-gray-50"
        >
          <Globe className="h-4 w-4" /> Visit website
        </a>
      )}
      {church.phone && (
        <a
          href={`tel:${church.phone.replace(/[^\d+]/g, '')}`}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 font-semibold hover:bg-gray-50"
        >
          <Phone className="h-4 w-4" /> {church.phone}
        </a>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 font-semibold hover:bg-gray-50"
        >
          <Mail className="h-4 w-4 shrink-0" /> <span className="truncate">{email}</span>
        </a>
      )}
    </div>
  );
};

const MobileVisitBar = ({ church }: { church: IChurch }) => {
  const next = getNextService(church.services);
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-gray-200 bg-white px-6 py-4 md:hidden">
      <div className="min-w-0 text-sm">
        {next ? (
          <>
            <p className="font-semibold">
              {next.dayLabel} · {formatTime(next.service.startTime)}
            </p>
            <p className="truncate text-gray-500">{next.service.serviceType}</p>
          </>
        ) : (
          <p className="font-semibold">Plan your visit</p>
        )}
      </div>
      <a
        href={directionsUrl(church)}
        target="_blank"
        rel="noreferrer"
        className="shrink-0 rounded-lg bg-brand-gradient px-6 py-3 font-semibold text-white"
      >
        Directions
      </a>
    </div>
  );
};

const ShareButton = ({ name }: { name: string }) => {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: name, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard?.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={() => void share()}
      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold underline hover:bg-gray-100"
    >
      <Share className="h-4 w-4" /> {copied ? 'Link copied' : 'Share'}
    </button>
  );
};

const ProfileSkeleton = () => (
  <main className="mx-auto max-w-6xl px-6 pt-6" aria-busy="true">
    <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200" />
    <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-gray-200" />
    <div className="mt-6 h-[280px] animate-pulse rounded-2xl bg-gray-200 sm:h-[420px]" />
  </main>
);

/** Structured data so search engines can show the church as a place of worship. */
const useChurchJsonLd = (church: IChurch | undefined) => {
  useEffect(() => {
    if (!church) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Church',
      name: church.name,
      url: window.location.href,
      telephone: church.phone ?? undefined,
      image: churchPhotos(church)
        .map((photo) => photo.url)
        .slice(0, 5),
      address: {
        '@type': 'PostalAddress',
        streetAddress: streetAddress(church),
        addressLocality: church.city,
        addressRegion: church.state,
        postalCode: church.zipCode,
      },
      geo: { '@type': 'GeoCoordinates', latitude: church.latitude, longitude: church.longitude },
      ...(church.reviewCount > 0 && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: church.avgRating,
          reviewCount: church.reviewCount,
        },
      }),
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, [church]);
};

export default ChurchPage;
