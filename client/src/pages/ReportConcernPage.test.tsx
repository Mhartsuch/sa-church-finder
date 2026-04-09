import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ToastProvider } from '@/hooks/useToast';

import { ReportConcernPage } from './ReportConcernPage';

describe('ReportConcernPage', () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    writeText.mockClear();

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText,
      },
    });
  });

  it('copies a structured concern summary and updates the email draft link', async () => {
    render(
      <ToastProvider>
        <MemoryRouter>
          <ReportConcernPage />
        </MemoryRouter>
      </ToastProvider>,
    );

    fireEvent.change(screen.getByLabelText('What are you reporting?'), {
      target: { value: 'Spam or scam listing' },
    });
    fireEvent.change(screen.getByLabelText('Page, church, or URL'), {
      target: { value: 'Grace Community Church profile' },
    });
    fireEvent.change(screen.getByLabelText('Your contact info (optional)'), {
      target: { value: 'member@example.com' },
    });
    fireEvent.change(screen.getByLabelText('What happened?'), {
      target: { value: 'The listing asked me to send money before attending.' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Copy concern summary' }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        expect.stringContaining('The listing asked me to send money before attending.'),
      );
    });

    expect(screen.getByRole('link', { name: 'Email the moderation team' })).toHaveAttribute(
      'href',
      expect.stringContaining('Concern%20report%3A%20Spam%20or%20scam%20listing'),
    );
  });
});
