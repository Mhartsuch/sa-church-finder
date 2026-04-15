import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ToastContainer } from '@/components/layout/Toast';
import { ToastProvider } from '@/hooks/ToastProvider';
import {
  buildFacebookShareUrl,
  buildMailtoShareUrl,
  buildTwitterShareUrl,
} from '@/lib/share-links';

import { ShareButton } from './ShareButton';

const target = {
  title: 'Grace Community Church',
  text: 'A welcoming community in San Antonio.',
  url: 'https://sachurchfinder.com/churches/grace',
};

const renderWithToast = () =>
  render(
    <ToastProvider>
      <ShareButton target={target} />
      <ToastContainer />
    </ToastProvider>,
  );

describe('ShareButton url builders', () => {
  it('builds a Twitter intent URL that embeds the shared URL and text', () => {
    const url = buildTwitterShareUrl(target);
    expect(url).toContain('https://twitter.com/intent/tweet?');
    const parsed = new URL(url);
    expect(parsed.searchParams.get('url')).toBe(target.url);
    expect(parsed.searchParams.get('text')).toBe(
      'Grace Community Church — A welcoming community in San Antonio.',
    );
  });

  it('builds a Facebook sharer URL', () => {
    const url = buildFacebookShareUrl(target);
    expect(url).toContain('https://www.facebook.com/sharer/sharer.php?');
    const parsed = new URL(url);
    expect(parsed.searchParams.get('u')).toBe(target.url);
  });

  it('builds a mailto URL with subject and body', () => {
    const url = buildMailtoShareUrl(target);
    expect(url.startsWith('mailto:?')).toBe(true);
    const qs = new URLSearchParams(url.slice('mailto:?'.length));
    expect(qs.get('subject')).toBe(target.title);
    expect(qs.get('body')).toContain(target.text);
    expect(qs.get('body')).toContain(target.url);
  });
});

describe('ShareButton', () => {
  const originalShare = (navigator as unknown as { share?: unknown }).share;
  const originalCanShare = (navigator as unknown as { canShare?: unknown }).canShare;
  const originalClipboard = (navigator as unknown as { clipboard?: unknown }).clipboard;

  afterEach(() => {
    // Restore navigator properties after each test.
    if (typeof originalShare === 'undefined') {
      delete (navigator as unknown as { share?: unknown }).share;
    } else {
      Object.defineProperty(navigator, 'share', { configurable: true, value: originalShare });
    }
    if (typeof originalCanShare === 'undefined') {
      delete (navigator as unknown as { canShare?: unknown }).canShare;
    } else {
      Object.defineProperty(navigator, 'canShare', {
        configurable: true,
        value: originalCanShare,
      });
    }
    if (typeof originalClipboard === 'undefined') {
      delete (navigator as unknown as { clipboard?: unknown }).clipboard;
    } else {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: originalClipboard,
      });
    }
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    // Start each test with no native share so the fallback menu is exercised by default.
    delete (navigator as unknown as { share?: unknown }).share;
    delete (navigator as unknown as { canShare?: unknown }).canShare;
  });

  it('renders a closed menu by default', () => {
    renderWithToast();
    const trigger = screen.getByRole('button', { name: /share/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens the fallback menu with copy + social share links when native share is unavailable', () => {
    renderWithToast();
    fireEvent.click(screen.getByRole('button', { name: /share/i }));

    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();

    expect(screen.getByRole('menuitem', { name: /copy link/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /share on x/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /share on facebook/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /share via email/i })).toBeInTheDocument();
  });

  it('copies the URL to the clipboard and shows a toast', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    renderWithToast();
    fireEvent.click(screen.getByRole('button', { name: /share/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /copy link/i }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(target.url);
    });
    await waitFor(() => {
      expect(screen.getByText(/link copied to clipboard/i)).toBeInTheDocument();
    });
    // The menu closes after copy.
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('invokes the native share sheet when available and skips the fallback menu', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { configurable: true, value: share });
    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: () => true,
    });

    renderWithToast();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
    });

    expect(share).toHaveBeenCalledWith({
      title: target.title,
      text: target.text,
      url: target.url,
    });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('falls back to the menu when the native share API throws a non-abort error', async () => {
    const share = vi.fn().mockRejectedValue(new Error('boom'));
    Object.defineProperty(navigator, 'share', { configurable: true, value: share });

    renderWithToast();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /share/i }));
    });

    expect(share).toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('closes the fallback menu when Escape is pressed', () => {
    renderWithToast();
    fireEvent.click(screen.getByRole('button', { name: /share/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
