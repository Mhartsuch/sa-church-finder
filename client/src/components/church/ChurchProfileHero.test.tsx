import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { IChurch } from '@/types/church';

import { ChurchProfileHero } from './ChurchProfileHero';

const church: IChurch = {
  id: 'church-1',
  name: 'Grace Fellowship',
  slug: 'grace-fellowship',
  denomination: 'Non-denominational',
  denominationFamily: 'Non-denominational',
  description: 'A welcoming neighborhood church with Sunday worship and community groups.',
  address: '123 Main St',
  city: 'San Antonio',
  state: 'TX',
  zipCode: '78205',
  neighborhood: 'Downtown',
  latitude: 29.4241,
  longitude: -98.4936,
  phone: '(210) 555-1234',
  email: null,
  website: 'www.gracefellowship.org',
  pastorName: null,
  yearEstablished: 1988,
  avgRating: 4.6,
  reviewCount: 18,
  googleRating: null,
  googleReviewCount: null,
  isClaimed: false,
  isSaved: false,
  languages: ['English', 'Spanish'],
  amenities: ['Wheelchair Accessible', 'Nursery', 'Coffee Bar'],
  coverImageUrl: null,
  services: [
    {
      id: 'service-1',
      dayOfWeek: 0,
      startTime: '09:00',
      endTime: '10:15',
      serviceType: 'Sunday Worship',
      language: 'English',
    },
    {
      id: 'service-2',
      dayOfWeek: 3,
      startTime: '19:00',
      endTime: '20:00',
      serviceType: 'Midweek Study',
      language: 'English',
    },
  ],
};

describe('ChurchProfileHero', () => {
  it('renders a polished fallback layout when no cover image exists', () => {
    const directionsUrl = 'https://www.google.com/maps/search/?api=1&query=123%20Main%20St';

    render(<ChurchProfileHero church={church} directionsUrl={directionsUrl} />);

    expect(screen.getByText(/visit snapshot/i)).toBeInTheDocument();
    expect(screen.getByText(/weekly rhythm/i)).toBeInTheDocument();
    expect(screen.getByText(/languages and access/i)).toBeInTheDocument();
    expect(screen.queryByText(/show all photos/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /visit website/i })).toHaveAttribute(
      'href',
      'https://www.gracefellowship.org',
    );
    expect(screen.getByRole('link', { name: /get directions/i })).toHaveAttribute(
      'href',
      directionsUrl,
    );
  });
});
