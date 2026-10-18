import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

vi.mock('@/app/(frontend)/actions/newsletter', () => ({
  // A recoverable rejection must return the submitted values, as the real action does.
  submitNewsletterForm: async (_previous: unknown, form: FormData) => ({
    success: false,
    message: 'We could not save your subscription just now. Please try again later.',
    values: { email: form.get('email'), consent: form.get('consent') === 'on' },
  }),
}));

import SubscribeForm from './SubscribeForm';

it('preserves email and explicit consent after repeated rejected submissions', async () => {
  render(<SubscribeForm />);
  // Test the browser-facing form reset, rather than only the server action's returned data.
  for (const email of ['first@example.com', 'second@example.com', 'second@example.com']) {
    fireEvent.change(screen.getByRole('textbox', { name: 'Email address' }), { target: { value: email } });
    const consent = screen.getByRole('checkbox');
    if (!(consent as HTMLInputElement).checked) fireEvent.click(consent);
    fireEvent.submit(screen.getByRole('button', { name: /^Subscribe/ }).closest('form')!);
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('could not save');
      expect(screen.getByRole('textbox', { name: 'Email address' })).toHaveValue(email);
      expect(screen.getByRole('checkbox')).toBeChecked();
      expect(screen.getByRole('button', { name: /^Subscribe/ })).not.toBeDisabled();
    });
  }
});
