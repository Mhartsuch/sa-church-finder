import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { CalendarEventInput } from '@/lib/calendar-links';

import { AddToCalendarButton } from './AddToCalendarButton';

const event: CalendarEventInput = {
  id: 'event-1',
  title: 'Sunday Worship',
  description: 'Join us for weekly worship.',
  startTime: '2026-05-03T15:00:00.000Z',
  endTime: '2026-05-03T16:30:00.000Z',
  location: '100 Main St',
  url: 'https://sachurchfinder.com/churches/grace',
};

describe('AddToCalendarButton', () => {
  it('renders a closed menu by default', () => {
    render(<AddToCalendarButton event={event} />);
    const trigger = screen.getByRole('button', { name: /add to calendar/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens the menu with three calendar options when clicked', () => {
    render(<AddToCalendarButton event={event} />);
    fireEvent.click(screen.getByRole('button', { name: /add to calendar/i }));

    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();

    const items = screen.getAllByRole('menuitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent(/google calendar/i);
    expect(items[1]).toHaveTextContent(/outlook/i);
    expect(items[2]).toHaveTextContent(/apple calendar/i);
  });

  it('links the Google option to calendar.google.com with event details', () => {
    render(<AddToCalendarButton event={event} />);
    fireEvent.click(screen.getByRole('button', { name: /add to calendar/i }));
    const googleLink = screen.getByRole('menuitem', { name: /google calendar/i });
    const href = googleLink.getAttribute('href') ?? '';
    expect(href).toContain('https://calendar.google.com/calendar/render');
    expect(href).toContain('text=Sunday+Worship');
    expect(href).toContain('20260503T150000Z%2F20260503T163000Z');
  });

  it('offers an ICS download with a slugified filename', () => {
    render(<AddToCalendarButton event={event} />);
    fireEvent.click(screen.getByRole('button', { name: /add to calendar/i }));
    const icsLink = screen.getByRole('menuitem', { name: /apple calendar/i });
    expect(icsLink).toHaveAttribute('download', 'sunday-worship.ics');
    expect(icsLink.getAttribute('href')).toMatch(/^data:text\/calendar/);
  });

  it('closes the menu when Escape is pressed', () => {
    render(<AddToCalendarButton event={event} />);
    fireEvent.click(screen.getByRole('button', { name: /add to calendar/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes the menu when clicking outside', () => {
    render(
      <div>
        <AddToCalendarButton event={event} />
        <button type="button">outside</button>
      </div>,
    );
    fireEvent.click(screen.getByRole('button', { name: /add to calendar/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole('button', { name: 'outside' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
