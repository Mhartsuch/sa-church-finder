import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ChurchCard } from './ChurchCard';
import { IChurchSummary } from '@/types/church';

const church: IChurchSummary = {
  id: 'church-1',
  name: 'Grace Fellowship',
  slug: 'grace-fellowship',
  denomination: 'Non-denominational',
  denominationFamily: null,
  description: null,
  address: '123 Main St',
  city: 'San Antonio',
  state: 'TX',
  zipCode: '78205',
  neighborhood: 'Downtown',
  latitude: 29.4241,
  longitude: -98.4936,
  phone: null,
  email: null,
  website: null,
  pastorName: null,
  yearEstablished: null,
  avgRating: 4.8,
  reviewCount: 12,
  isClaimed: false,
  isSaved: false,
  languages: ['English'],
  amenities: [],
  coverImageUrl: null,
  services: [
    {
      id: 'service-1',
      dayOfWeek: 0,
      startTime: '09:00',
      endTime: null,
      serviceType: 'Sunday Worship',
      language: 'English',
    },
  ],
  distance: 2.4,
};

describe('ChurchCard', () => {
  it('renders a keyboard-focusable control for opening the church profile', () => {
    const onHover = vi.fn();
    const onClick = vi.fn();
    const onToggleSave = vi.fn();

    render(
      <ChurchCard
        church={church}
        isHovered={false}
        isCompared={false}
        onHover={onHover}
        onClick={onClick}
        onToggleCompare={vi.fn()}
        onToggleSave={onToggleSave}
      />,
    );

    const profileButton = screen.getByRole('button', {
      name: /view grace fellowship profile/i,
    });

    profileButton.focus();

    expect(profileButton).toHaveFocus();
    expect(onHover).toHaveBeenCalledWith('church-1');

    fireEvent.click(profileButton);

    expect(onClick).toHaveBeenCalledWith('grace-fellowship');
  });

  it('keeps the save button from triggering navigation', () => {
    const onHover = vi.fn();
    const onClick = vi.fn();
    const onToggleSave = vi.fn();

    render(
      <ChurchCard
        church={church}
        isHovered={false}
        isCompared={false}
        onHover={onHover}
        onClick={onClick}
        onToggleCompare={vi.fn()}
        onToggleSave={onToggleSave}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /save grace fellowship/i }));

    expect(onClick).not.toHaveBeenCalled();
    expect(onToggleSave).toHaveBeenCalledWith('church-1');
  });
});
