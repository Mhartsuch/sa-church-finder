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
});
