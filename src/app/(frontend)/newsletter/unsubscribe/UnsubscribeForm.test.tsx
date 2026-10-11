import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

vi.mock('@/app/(frontend)/actions/newsletter', () => ({
  // The real action returns the address so a temporary failure can be retried.
  unsubscribeNewsletter: async (_previous: unknown, form: FormData) => ({
    done: false,
    message: 'We could not process this just now. Please try again later.',
    values: { email: form.get('email') },
  }),
}));

import { UnsubscribeForm } from './UnsubscribeForm';

it('preserves the unsubscribe address after repeated recoverable failures', async () => {
  render(<UnsubscribeForm />);
  // Exercise the action reset with changed and repeated addresses.
  for (const email of ['first@example.com', 'second@example.com', 'second@example.com']) {
    fireEvent.change(screen.getByRole('textbox', { name: 'Email address to unsubscribe' }), { target: { value: email } });
    fireEvent.submit(screen.getByRole('button', { name: 'Unsubscribe' }).closest('form')!);
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('could not process');
      expect(screen.getByRole('textbox', { name: 'Email address to unsubscribe' })).toHaveValue(email);
      expect(screen.getByRole('button', { name: 'Unsubscribe' })).not.toBeDisabled();
    });
  }
});
