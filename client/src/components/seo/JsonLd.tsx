/* eslint-disable react-refresh/only-export-components */
import { IChurch } from '@/types/church';
import { getDayName } from '@/utils/format';

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

const dayToSchema: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

export function buildChurchJsonLd(church: IChurch): Record<string, unknown> {
  const openingHours = church.services.map((s) => {
    const day = dayToSchema[s.dayOfWeek] ?? getDayName(s.dayOfWeek);
    const start = s.startTime.replace(':', '');
    const end = s.endTime?.replace(':', '') ?? '';
    return end ? `${day} ${start}-${end}` : `${day} ${start}`;
  });

  const result: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Church',
    name: church.name,
    description: church.description ?? undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: church.address,
      addressLocality: church.city,
      addressRegion: church.state,
      postalCode: church.zipCode,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: church.latitude,
      longitude: church.longitude,
    },
    url: `https://sachurchfinder.com/churches/${church.slug}`,
  };

  if (church.phone) result.telephone = church.phone;
  if (church.website) result.sameAs = church.website;
  if (church.coverImageUrl) result.image = church.coverImageUrl;
  if (church.yearEstablished) result.foundingDate = String(church.yearEstablished);

  if (openingHours.length > 0) {
    result.openingHours = openingHours;
  }

  if (church.reviewCount > 0) {
    result.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: church.avgRating,
      reviewCount: church.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return result;
}

export function buildWebsiteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SA Church Finder',
    url: 'https://sachurchfinder.com',
    description:
      'Discover churches across San Antonio with neighborhood search, detailed profiles, and community-driven reviews.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://sachurchfinder.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
