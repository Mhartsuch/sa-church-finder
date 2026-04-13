import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import NotFoundPage from './NotFoundPage';

vi.mock('@/hooks/useDocumentHead', () => ({
  useDocumentHead: vi.fn(),
}));

const renderNotFoundPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/nonexistent']}>
        <NotFoundPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('NotFoundPage', () => {
  it('renders the 404 code', () => {
    renderNotFoundPage();

    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('shows the page not found heading', () => {
    renderNotFoundPage();

    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
  });

  it('shows a descriptive message', () => {
    renderNotFoundPage();

    expect(screen.getByText(/couldn't find the page/i)).toBeInTheDocument();
  });

  it('has a Home link', () => {
    renderNotFoundPage();

    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('has a Search churches link', () => {
    renderNotFoundPage();

    const searchLink = screen.getByRole('link', { name: /search churches/i });
    expect(searchLink).toHaveAttribute('href', '/search');
  });

  it('has a Go back button', () => {
    renderNotFoundPage();

    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });
});
