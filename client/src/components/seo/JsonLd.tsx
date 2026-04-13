import { IChurch } from '@/types/church';

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
      }}
    />
  );
}

/** Schema.org Church / PlaceOfWorship markup for individual church pages. */
export function ChurchJsonLd({ church }: { church: IChurch }): JSX.Element {
  const rating = church.reviewCount > 0 ? church.avgRating : (church.googleRating ?? 0);
  const reviewCount = church.reviewCount > 0 ? church.reviewCount : (church.googleReviewCount ?? 0);

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['Church', 'PlaceOfWorship'],
    name: church.name,
    url: `https://sachurchfinder.com/churches/${church.slug}`,
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
