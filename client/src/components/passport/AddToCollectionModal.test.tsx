import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiRequestError } from '@/lib/api-client';
import { IChurchCollection } from '@/types/passport';

import { AddToCollectionModal } from './AddToCollectionModal';

const useUserCollectionsMock = vi.fn();
const addChurchMutateAsyncMock = vi.fn();
const createCollectionMutateAsyncMock = vi.fn();
const addToastMock = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuthSession: () => ({
    user: { id: 'user-1', name: 'Maria Garcia', email: 'maria@example.com' },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

vi.mock('@/hooks/usePassport', () => ({
  useUserCollections: (userId: string | null) => useUserCollectionsMock(userId),
  useAddChurchToCollection: () => ({
    mutateAsync: addChurchMutateAsyncMock,
    isPending: false,
    variables: undefined,
  }),
  useCreateCollection: () => ({
    mutateAsync: createCollectionMutateAsyncMock,
    isPending: false,
  }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ addToast: addToastMock }),
}));

const MOCK_COLLECTIONS: IChurchCollection[] = [
  {
    id: 'col-1',
    userId: 'user-1',
    name: 'My Favorites',
    description: null,
    slug: 'my-favorites',
    isPublic: true,
    churchCount: 5,
    createdAt: '2024-07-01T00:00:00.000Z',
    updatedAt: '2025-01-10T00:00:00.000Z',
  },
  {
    id: 'col-2',
    userId: 'user-1',
    name: 'To Visit',
    description: null,
    slug: 'to-visit',
    isPublic: false,
    churchCount: 1,
    createdAt: '2024-08-01T00:00:00.000Z',
    updatedAt: '2025-01-05T00:00:00.000Z',
  },
];

describe('AddToCollectionModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useUserCollectionsMock.mockReturnValue({ data: MOCK_COLLECTIONS, isLoading: false });
  });

  const renderModal = () =>
    render(
      <AddToCollectionModal
        churchId="church-1"
        churchName="San Fernando Cathedral"
        onClose={onClose}
      />,
    );

  it('lists the signed-in user collections with church counts', () => {
    renderModal();

    expect(screen.getByText('My Favorites')).toBeInTheDocument();
    expect(screen.getByText('5 churches')).toBeInTheDocument();
    expect(screen.getByText('To Visit')).toBeInTheDocument();
    expect(screen.getByText('1 church')).toBeInTheDocument();
  });

  it('requests collections for the signed-in user', () => {
    renderModal();

    expect(useUserCollectionsMock).toHaveBeenCalledWith('user-1');
  });

  it('adds the church to the chosen collection and closes', async () => {
    addChurchMutateAsyncMock.mockResolvedValue({});

    renderModal();

    fireEvent.click(screen.getByRole('button', { name: /my favorites/i }));

    await waitFor(() => {
      expect(addChurchMutateAsyncMock).toHaveBeenCalledWith({
        collectionId: 'col-1',
        churchId: 'church-1',
      });
    });

    await waitFor(() => {
      expect(addToastMock).toHaveBeenCalledWith({
        message: 'Added San Fernando Cathedral to "My Favorites"',
        variant: 'success',
      });
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('shows a friendly message when the church is already in the collection', async () => {
    addChurchMutateAsyncMock.mockRejectedValue(
      new ApiRequestError('Church is already in this collection', 409, 'CONFLICT'),
    );

    renderModal();

    fireEvent.click(screen.getByRole('button', { name: /to visit/i }));

    await waitFor(() => {
      expect(addToastMock).toHaveBeenCalledWith({
        message: `San Fernando Cathedral is already in "To Visit" — you're all set!`,
        variant: 'info',
      });
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('surfaces other errors and keeps the modal open', async () => {
    addChurchMutateAsyncMock.mockRejectedValue(new Error('Something went sideways'));

    renderModal();

    fireEvent.click(screen.getByRole('button', { name: /my favorites/i }));

    await waitFor(() => {
      expect(addToastMock).toHaveBeenCalledWith({
        message: 'Something went sideways',
        variant: 'error',
      });
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('reveals the new-collection form from the shortcut', () => {
    renderModal();

    expect(screen.queryByLabelText(/new collection name/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /new collection/i }));

    expect(screen.getByLabelText(/new collection name/i)).toBeInTheDocument();
  });

  it('creates a collection then adds the church from the shortcut', async () => {
    createCollectionMutateAsyncMock.mockResolvedValue({
      ...MOCK_COLLECTIONS[0],
      id: 'col-new',
      name: 'Historic Churches',
    });
    addChurchMutateAsyncMock.mockResolvedValue({});

    renderModal();

    fireEvent.click(screen.getByRole('button', { name: /new collection/i }));
    fireEvent.change(screen.getByLabelText(/new collection name/i), {
      target: { value: 'Historic Churches' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create collection & add church/i }));

    await waitFor(() => {
      expect(createCollectionMutateAsyncMock).toHaveBeenCalledWith({ name: 'Historic Churches' });
    });
    await waitFor(() => {
      expect(addChurchMutateAsyncMock).toHaveBeenCalledWith({
        collectionId: 'col-new',
        churchId: 'church-1',
      });
    });
    await waitFor(() => {
      expect(addToastMock).toHaveBeenCalledWith({
        message: 'Created "Historic Churches" and added San Fernando Cathedral',
        variant: 'success',
      });
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('shows a warm empty state with the create form when there are no collections', () => {
    useUserCollectionsMock.mockReturnValue({ data: [], isLoading: false });

    renderModal();

    expect(
      screen.getByText(/you don't have any collections yet — start your first one below\./i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/new collection name/i)).toBeInTheDocument();
  });

  it('shows a spinner while collections load', () => {
    useUserCollectionsMock.mockReturnValue({ data: undefined, isLoading: true });

    renderModal();

    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalled();
  });
});
