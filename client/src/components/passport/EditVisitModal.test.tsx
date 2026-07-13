import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EditVisitModal } from './EditVisitModal';

describe('EditVisitModal', () => {
  const onSubmit = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderModal = ({
    initialNotes = 'Loved the choir.' as string | null,
    initialRating = 4 as number | null,
    isPending = false,
  } = {}) =>
    render(
      <EditVisitModal
        churchName="San Fernando Cathedral"
        initialNotes={initialNotes}
        initialRating={initialRating}
        isPending={isPending}
        onSubmit={onSubmit}
        onClose={onClose}
      />,
    );

  it('shows the church name and prefills existing notes', () => {
    renderModal();

    expect(screen.getByText('San Fernando Cathedral')).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toHaveValue('Loved the choir.');
  });

  it('shows the current rating', () => {
    renderModal();

    expect(screen.getByText('4/5')).toBeInTheDocument();
  });

  it('submits updated notes and rating', () => {
    renderModal();

    fireEvent.change(screen.getByLabelText(/notes/i), {
      target: { value: '  The organ was stunning.  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Rate 5 stars' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onSubmit).toHaveBeenCalledWith({
      notes: 'The organ was stunning.',
      rating: 5,
    });
  });

  it('clears the rating when the selected star is tapped again', () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Rate 4 stars' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onSubmit).toHaveBeenCalledWith({
      notes: 'Loved the choir.',
      rating: null,
    });
  });

  it('handles visits without notes or rating', () => {
    renderModal({ initialNotes: null, initialRating: null });

    expect(screen.getByLabelText(/notes/i)).toHaveValue('');
    expect(screen.queryByText(/\/5$/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onSubmit).toHaveBeenCalledWith({ notes: '', rating: null });
  });

  it('shows a pending state while saving', () => {
    renderModal({ isPending: true });

    expect(screen.getByRole('button', { name: 'Saving changes...' })).toBeDisabled();
  });

  it('calls onClose when the close button is clicked', () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalled();
  });
});
