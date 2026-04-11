import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IChurchSummary } from '@/types/church';

import { SearchSuggestions } from './SearchSuggestions';

const useChurchSuggestionsMock = vi.fn();

vi.mock('@/hooks/useChurchSuggestions', () => ({
  useChurchSuggestions: (...args: unknown[]) => useChurchSuggestionsMock(...args),
}));

const buildChurch = (overrides: Partial<IChurchSummary> = {}): IChurchSummary =>
  ({
    id: 'church-1',
    name: 'San Fernando Cathedral',
    slug: 'san-fernando-cathedral',
    denomination: 'Catholic',
    denominationFamily: 'Catholic',
    description: null,
    address: '115 Main Plaza',
    city: 'San Antonio',
    state: 'TX',
    zipCode: '78205',
    neighborhood: 'Downtown',
    latitude: 29.42,
    longitude: -98.49,
    phone: null,
    email: null,
    website: null,
    pastorName: null,
    yearEstablished: null,
    avgRating: 4.6,
    reviewCount: 12,
    googleRating: null,
    googleReviewCount: null,
    isClaimed: true,
    isSaved: false,
    languages: [],
    amenities: [],
    coverImageUrl: null,
    businessStatus: null,
    googleMapsUrl: null,
    primaryType: null,
    goodForChildren: null,
    goodForGroups: null,
    wheelchairAccessible: null,
    services: [],
    distance: 0,
    ...overrides,
  }) as IChurchSummary;

const defaultProps = {
  term: '',
  recent: [] as string[],
  onApplyTerm: vi.fn(),
  onNavigateToChurch: vi.fn(),
  onRemoveRecent: vi.fn(),
  onClearRecent: vi.fn(),
};

describe('SearchSuggestions', () => {
  beforeEach(() => {
    useChurchSuggestionsMock.mockReset();
    useChurchSuggestionsMock.mockReturnValue({
      suggestions: [],
      isFetching: false,
      debouncedTerm: '',
    });
    defaultProps.onApplyTerm = vi.fn();
    defaultProps.onNavigateToChurch = vi.fn();
    defaultProps.onRemoveRecent = vi.fn();
    defaultProps.onClearRecent = vi.fn();
  });

  it('renders nothing when there is no term and no recents', () => {
    const { container } = render(<SearchSuggestions {...defaultProps} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('lists recent searches when the term is empty', () => {
    render(<SearchSuggestions {...defaultProps} recent={['Catholic', 'Baptist']} />);

    expect(screen.getByText('Recent searches')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Catholic/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Baptist/ })).toBeInTheDocument();
  });

  it('invokes onApplyTerm when a recent search is clicked', () => {
    const onApplyTerm = vi.fn();
    render(<SearchSuggestions {...defaultProps} recent={['Catholic']} onApplyTerm={onApplyTerm} />);

    fireEvent.click(screen.getByRole('option', { name: /Catholic/ }));

    expect(onApplyTerm).toHaveBeenCalledWith('Catholic');
  });

  it('removes a specific recent search from the list', () => {
    const onRemoveRecent = vi.fn();
    render(
      <SearchSuggestions {...defaultProps} recent={['Catholic']} onRemoveRecent={onRemoveRecent} />,
    );

    fireEvent.click(screen.getByLabelText('Remove recent search Catholic'));

    expect(onRemoveRecent).toHaveBeenCalledWith('Catholic');
  });

  it('clears all recent searches when "Clear" is pressed', () => {
    const onClearRecent = vi.fn();
    render(
      <SearchSuggestions
        {...defaultProps}
        recent={['Catholic', 'Baptist']}
        onClearRecent={onClearRecent}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onClearRecent).toHaveBeenCalled();
  });

  it('shows a "search for" action and matching churches when typing', () => {
    useChurchSuggestionsMock.mockReturnValue({
      suggestions: [buildChurch()],
      isFetching: false,
      debouncedTerm: 'san fe',
    });

    render(<SearchSuggestions {...defaultProps} term="san fe" />);

    expect(screen.getByRole('option', { name: /Search for .*san fe/i })).toBeInTheDocument();
    expect(screen.getByText('San Fernando Cathedral')).toBeInTheDocument();
    expect(screen.getByText(/Catholic.*Downtown/)).toBeInTheDocument();
  });

  it('navigates to a church when a suggestion is clicked', () => {
    useChurchSuggestionsMock.mockReturnValue({
      suggestions: [buildChurch()],
      isFetching: false,
      debouncedTerm: 'san fe',
    });

    const onNavigateToChurch = vi.fn();
    render(
      <SearchSuggestions {...defaultProps} term="san fe" onNavigateToChurch={onNavigateToChurch} />,
    );

    fireEvent.click(screen.getByRole('option', { name: /San Fernando Cathedral/ }));

    expect(onNavigateToChurch).toHaveBeenCalledWith('san-fernando-cathedral');
  });

  it('shows an empty-state message when no churches match and we are not fetching', () => {
    useChurchSuggestionsMock.mockReturnValue({
      suggestions: [],
      isFetching: false,
      debouncedTerm: 'zzz',
    });

    render(<SearchSuggestions {...defaultProps} term="zzz" />);

    expect(screen.getByText(/no church names match yet/i)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Search for .*zzz/i })).toBeInTheDocument();
  });
});
