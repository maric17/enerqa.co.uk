'use client';

import React, { useActionState } from 'react';
import { unsubscribeNewsletter, type UnsubscribeFormState } from '@/app/(frontend)/actions/newsletter';

const initialState: UnsubscribeFormState = { done: false };

export function UnsubscribeForm() {
  const [state, formAction, isPending] = useActionState(unsubscribeNewsletter, initialState);

  // Same wording whether or not the address was subscribed, so the form never
  // reveals who is on the list.
  if (state.done) {
    return (
      <p role="status" className="text-lg text-gray-700">
        Done. If that address was on the Enerqa newsletter list, it will receive no further newsletter emails.
      </p>
    );
  }

  return (
    // Rebuild from returned values so React's action reset does not erase a failed request.
    <form key={JSON.stringify(state.values ?? {})} action={formAction} className="mx-auto flex max-w-md flex-col gap-4 text-left">
      {/* Honeypot (p. 228 spam protection). Clipped in place (`sr-only`), not
          moved to left: -9999px, which caused sideways scroll in RTL. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="unsub-website">Website</label>
        <input type="text" id="unsub-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label htmlFor="unsub-email" className="font-semibold text-[var(--color-dark)]">
        Email address to unsubscribe
      </label>
      {/* A dark visible ring keeps the withdrawal form usable with a keyboard. */}
      <input
        id="unsub-email"
        type="email"
        name="email"
        defaultValue={state.values?.email ?? ''}
        required
        autoComplete="email"
        disabled={isPending}
        className="rounded-lg border border-gray-300 px-4 py-3 focus-visible:outline-2 focus-visible:outline-[var(--color-primary-deep)] focus-visible:outline-offset-2"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-[var(--color-dark)] px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-60"
      >
        {isPending ? 'Unsubscribing…' : 'Unsubscribe'}
      </button>
      {state.message && (
        <p role="alert" className="m-0 text-sm text-red-700">{state.message}</p>
      )}
    </form>
  );
}
