import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { SitemapPage } from './SitemapPage';

describe('SitemapPage', () => {
  it('lists the main public and legal routes', () => {
    render(
      <MemoryRouter>
        <SitemapPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Sitemap' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Search churches' })[0]).toHaveAttribute(
      'href',
      '/search',
    );
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms');
    expect(screen.getByRole('link', { name: 'Help Center' })).toHaveAttribute(
      'href',
      '/help-center',
    );
  });
});
