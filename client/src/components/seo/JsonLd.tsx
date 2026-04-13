import { IChurch, IChurchService } from '@/types/church';
import { IAggregatedEvent } from '@/types/event';

const SITE_URL = 'https://sachurchfinder.com';

/** Renders a <script type="application/ld+json"> tag with the given data. */
function JsonLdScript({ data }: { data: Record<string, unknown> }): JSX.Element {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

/** Schema.org WebSite markup for the home page (enables sitelinks search box). */
export function WebSiteJsonLd(): JSX.Element {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'SA Church Finder',
        url: SITE_URL,
        description:
          'Discover churches across San Antonio with neighborhood search, detailed profiles, and community-driven reviews.',
        publisher: {
          '@type': 'Organization',
          name: 'SA Church Finder',
          url: SITE_URL,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  );
}

const SCHEMA_ORG_DAYS = [
  'https://schema.org/Sunday',
  'https://schema.org/Monday',
  'https://schema.org/Tuesday',
  'https://schema.org/Wednesday',
  'https://schema.org/Thursday',
  'https://schema.org/Friday',
  'https://schema.org/Saturday',
] as const;

/** Build Schema.org openingHoursSpecification from church services. */
function buildOpeningHours(services: IChurchService[]): Array<Record<string, unknown>> | undefined {
  if (services.length === 0) return undefined;

  return services.map((s) => {
    const spec: Record<string, unknown> = {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: SCHEMA_ORG_DAYS[s.dayOfWeek] ?? SCHEMA_ORG_DAYS[0],
      opens: s.startTime,
    };
    if (s.endTime) {
      spec.closes = s.endTime;
    }
    return spec;
  });
}

/** Schema.org Church / PlaceOfWorship markup for individual church pages. */
export function ChurchJsonLd({ church }: { church: IChurch }): JSX.Element {
  const rating = church.reviewCount > 0 ? church.avgRating : (church.googleRating ?? 0);
  const reviewCount = church.reviewCount > 0 ? church.reviewCount : (church.googleReviewCount ?? 0);

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['Church', 'PlaceOfWorship'],
    name: church.name,
    url: `${SITE_URL}/churches/${church.slug}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: church.address,
      addressLocality: church.city,
      addressRegion: church.state,
      postalCode: church.zipCode,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: church.latitude,
      longitude: church.longitude,
    },
  };

  if (church.description) {
    data.description = church.description;
  }

  if (church.phone) {
    data.telephone = church.phone;
  }

  if (church.email) {
    data.email = church.email;
  }

  if (church.website) {
    data.sameAs = church.website;
  }

  if (church.coverImageUrl) {
    data.image = church.coverImageUrl;
  }

  if (church.photos && church.photos.length > 0) {
    data.image = church.photos.map((p) => p.url);
  }

  if (church.yearEstablished) {
    data.foundingDate = String(church.yearEstablished);
  }

  if (church.wheelchairAccessible) {
    data.isAccessibleForFree = true;
  }

  const openingHours = buildOpeningHours(church.services);
  if (openingHours) {
    data.openingHoursSpecification = openingHours;
  }

  if (rating > 0 && reviewCount > 0) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.toFixed(1),
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return <JsonLdScript data={data} />;
}

/** BreadcrumbList markup for church profile pages. */
export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}): JSX.Element {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

/** Schema.org FAQPage markup for the help center. */
export function FAQPageJsonLd({
  questions,
}: {
  questions: Array<{ question: string; answer: string }>;
}): JSX.Element {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: questions.map((q) => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: q.answer,
          },
        })),
      }}
    />
  );
}

/** Schema.org ItemList markup for event listings. */
export function EventListJsonLd({ events }: { events: IAggregatedEvent[] }): JSX.Element | null {
  if (events.length === 0) return null;

  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: events.slice(0, 10).map((event, index) => {
          const item: Record<string, unknown> = {
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Event',
              name: event.title,
              startDate: event.startTime,
              ...(event.endTime ? { endDate: event.endTime } : {}),
              ...(event.description ? { description: event.description } : {}),
              eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
              location: {
                '@type': 'Place',
                name: event.church.name,
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: event.church.city,
                  addressRegion: 'TX',
                  addressCountry: 'US',
                },
              },
              organizer: {
                '@type': 'Organization',
                name: event.church.name,
                url: `${SITE_URL}/churches/${event.church.slug}`,
              },
            },
          };
          return item;
        }),
      }}
    />
  );
}
