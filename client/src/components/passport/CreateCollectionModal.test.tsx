import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateCollectionModal } from './CreateCollectionModal';

describe('CreateCollectionModal', () => {
  const onSubmit = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderModal = (isPending = false) =>
    render(<CreateCollectionModal isPending={isPending} onSubmit={onSubmit} onClose={onClose} />);

  it('renders name, description, and visibility fields', () => {
    renderModal();

    expect(screen.getByRole('heading', { name: 'New collection' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/share publicly/i)).toBeInTheDocument();
  });

  it('defaults the collection to public', () => {
    renderModal();

    expect(screen.getByLabelText(/share publicly/i)).toBeChecked();
  });

  it('disables submit until a name is entered', () => {
    renderModal();

    const submit = screen.getByRole('button', { name: 'Create collection' });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: 'Best Music' } });
    expect(submit).toBeEnabled();
  });

  it('submits trimmed name and description with isPublic true', () => {
    renderModal();

    fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: '  Best Music  ' } });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: '  Churches with amazing worship teams.  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create collection' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Best Music',
      description: 'Churches with amazing worship teams.',
      isPublic: true,
    });
  });

  it('omits an empty description from the submitted input', () => {
    renderModal();

    fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: 'To Visit' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create collection' }));

    expect(onSubmit).toHaveBeenCalledWith({ name: 'To Visit', isPublic: true });
  });

  it('submits isPublic false when the toggle is unchecked', () => {
    renderModal();

    fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: 'Private Picks' } });
    fireEvent.click(screen.getByLabelText(/share publicly/i));
    fireEvent.click(screen.getByRole('button', { name: 'Create collection' }));

    expect(onSubmit).toHaveBeenCalledWith({ name: 'Private Picks', isPublic: false });
  });

  it('limits the name to 100 characters and description to 500', () => {
    renderModal();

    expect(screen.getByLabelText(/^name/i)).toHaveAttribute('maxlength', '100');
    expect(screen.getByLabelText(/description/i)).toHaveAttribute('maxlength', '500');
  });

  it('shows a pending state while the collection is being created', () => {
    renderModal(true);

    expect(screen.getByRole('button', { name: 'Creating collection...' })).toBeDisabled();
  });

  it('calls onClose when the close button is clicked', () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalled();
  });
});
