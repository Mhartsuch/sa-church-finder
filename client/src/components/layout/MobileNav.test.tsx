import '@testing-library/jest-dom/vitest';
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { setViewport } from '@/test-utils/viewport';

import { MobileNav, MOBILE_NAV_BREAKPOINT } from './MobileNav';

describe('MobileNav', () => {
  const cleanups: Array<() => void> = [];

  afterEach(() => {
    while (cleanups.length > 0) {
      cleanups.pop()?.();
    }
  });

  const renderAt = (width: number, props: Parameters<typeof MobileNav>[0] = {}) => {
    cleanups.push(setViewport(width));
    return render(
      <MemoryRouter initialEntries={['/']}>
        <MobileNav {...props} />
      </MemoryRouter>,
    );
  };

  it('renders the primary actions on narrow viewports', () => {
    renderAt(375);

    expect(screen.getByRole('navigation', { name: /primary mobile navigation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /explore/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /wishlist/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dark theme|light theme/i })).toBeInTheDocument();
  });

  it('renders at tablet widths below the lg breakpoint so header nav gaps stay covered', () => {
    // 820px (portrait iPad) is below lg (1024), so the mobile nav should
    // still be visible to replace the desktop header links.
    expect(820).toBeLessThan(MOBILE_NAV_BREAKPOINT);
    renderAt(820);

    expect(screen.getByRole('navigation', { name: /primary mobile navigation/i })).toBeInTheDocument();
  });

  it('stays hidden at desktop widths', () => {
    renderAt(1280);

    expect(screen.queryByRole('navigation', { name: /primary mobile navigation/i })).not.toBeInTheDocument();
  });

  it('only renders the Map button when a toggle handler is provided', () => {
    const { rerender } = renderAt(375);
    expect(screen.queryByRole('button', { name: /show map|hide map/i })).not.toBeInTheDocument();

    const toggle = vi.fn();
    rerender(
      <MemoryRouter initialEntries={['/']}>
        <MobileNav onToggleMap={toggle} showMap={false} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /show map/i })).toBeInTheDocument();
  });

  it('swaps visibility when the viewport crosses the breakpoint at runtime', () => {
    const teardown = setViewport(375);
    cleanups.push(teardown);

    render(
      <MemoryRouter initialEntries={['/']}>
        <MobileNav />
      </MemoryRouter>,
    );

    expect(screen.getByRole('navigation', { name: /primary mobile navigation/i })).toBeInTheDocument();

    // Resize up to desktop — the component listens to `resize` and should
    // unmount the nav on the next render.
    act(() => {
      cleanups.push(setViewport(1280));
    });

    expect(screen.queryByRole('navigation', { name: /primary mobile navigation/i })).not.toBeInTheDocument();
  });
});
