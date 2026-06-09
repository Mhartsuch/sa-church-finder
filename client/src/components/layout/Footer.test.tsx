import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { Footer } from './Footer';

describe('Footer', () => {
  it('renders the support links as client routes', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Help Center' })).toHaveAttribute(
      'href',
      '/help-center',
    );
    expect(screen.getByRole('link', { name: 'Safety information' })).toHaveAttribute(
      'href',
      '/safety-information',
    );
    expect(screen.getByRole('link', { name: 'Accessibility' })).toHaveAttribute(
      'href',
      '/accessibility',
    );
    expect(screen.getByRole('link', { name: 'Report a concern' })).toHaveAttribute(
      'href',
      '/report-a-concern',
    );
  });

  it('renders the legal footer links as client routes', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms');
    expect(screen.getByRole('link', { name: 'Sitemap' })).toHaveAttribute('href', '/sitemap');
  });

  it('routes the discovery and product links to real destinations', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'All San Antonio churches' })).toHaveAttribute(
      'href',
      '/search',
    );
    expect(screen.getByRole('link', { name: 'Historic missions' })).toHaveAttribute(
      'href',
      '/search?q=mission',
    );
    expect(screen.getByRole('link', { name: 'List your church' })).toHaveAttribute(
      'href',
      '/leaders',
    );
    expect(screen.getByRole('link', { name: 'Compare churches' })).toHaveAttribute(
      'href',
      '/compare',
    );
  });

  it('renders no dead footer controls (every entry is a real link)', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText('About us')).not.toBeInTheDocument();
    expect(screen.queryByText('Careers')).not.toBeInTheDocument();
    expect(screen.queryByText('Blog')).not.toBeInTheDocument();
    expect(screen.queryByText('English (US)')).not.toBeInTheDocument();
  });
});
