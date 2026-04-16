import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SubscribeToCalendarButton } from './SubscribeToCalendarButton';

const FEED_URL = 'https://api.sachurchfinder.com/api/v1/churches/grace-fellowship/events.ics';

describe('SubscribeToCalendarButton', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with a closed menu by default', () => {
    render(<SubscribeToCalendarButton feedUrl={FEED_URL} />);
    const trigger = screen.getByRole('button', { name: /subscribe to calendar/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens the menu and exposes the three subscribe targets + copy option', () => {
    render(<SubscribeToCalendarButton feedUrl={FEED_URL} />);
    fireEvent.click(screen.getByRole('button', { name: /subscribe to calendar/i }));

    const items = screen.getAllByRole('menuitem');
    expect(items).toHaveLength(4);
    expect(items[0]).toHaveTextContent(/apple calendar/i);
    expect(items[1]).toHaveTextContent(/google calendar/i);
    expect(items[2]).toHaveTextContent(/outlook/i);
    expect(items[3]).toHaveTextContent(/copy feed url/i);
  });

  it('swaps https:// for webcal:// on the Apple Calendar link', () => {
    render(<SubscribeToCalendarButton feedUrl={FEED_URL} />);
    fireEvent.click(screen.getByRole('button', { name: /subscribe to calendar/i }));

    const appleLink = screen.getByRole('menuitem', { name: /apple calendar/i });
    expect(appleLink).toHaveAttribute(
      'href',
      'webcal://api.sachurchfinder.com/api/v1/churches/grace-fellowship/events.ics',
    );
  });

  it('URL-encodes the feed URL for Google Calendar', () => {
    render(<SubscribeToCalendarButton feedUrl={FEED_URL} />);
    fireEvent.click(screen.getByRole('button', { name: /subscribe to calendar/i }));

    const googleLink = screen.getByRole('menuitem', { name: /google calendar/i });
    expect(googleLink.getAttribute('href')).toBe(
      `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(FEED_URL)}`,
    );
  });

  it('builds the Outlook "add from web" link with an encoded URL', () => {
    render(<SubscribeToCalendarButton feedUrl={FEED_URL} />);
    fireEvent.click(screen.getByRole('button', { name: /subscribe to calendar/i }));

    const outlookLink = screen.getByRole('menuitem', { name: /outlook/i });
    const href = outlookLink.getAttribute('href') ?? '';
    expect(href).toContain('https://outlook.live.com/calendar/0/addfromweb');
    expect(href).toContain(`url=${encodeURIComponent(FEED_URL)}`);
  });

  it('copies the feed URL to the clipboard when the copy item is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<SubscribeToCalendarButton feedUrl={FEED_URL} />);
    fireEvent.click(screen.getByRole('button', { name: /subscribe to calendar/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /copy feed url/i }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(FEED_URL);
    });
    expect(await screen.findByRole('menuitem', { name: /feed url copied/i })).toBeInTheDocument();
  });

  it('closes the menu when Escape is pressed', () => {
    render(<SubscribeToCalendarButton feedUrl={FEED_URL} />);
    fireEvent.click(screen.getByRole('button', { name: /subscribe to calendar/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
