'use client';

import React, { useActionState, useId } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { submitNewsletterForm, NewsletterFormState } from '@/app/(frontend)/actions/newsletter';

const initialState: NewsletterFormState = {
  success: false,
};

/**
 * Newsletter signup, shared by the footer (dark) and the Knowledge Hub K06
 * block (light).
 *
 * p. 174: "Newsletter subscription is separate explicit consent", so the form
 * carries its own unticked consent checkbox. The server action already required
 * one; this form used to omit it, so every footer signup failed validation.
 * On success the action redirects to /newsletter/confirm (p. 4's confirmation
 * state), so there is no in-form success branch here.
 */
export default function SubscribeForm({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const [state, formAction, isPending] = useActionState(submitNewsletterForm, initialState);
  // Unique ids: the footer and a page block can both render this form.
  const id = useId();
  const isDark = tone === 'dark';

  // Placeholder text needs 4.5:1 too (p. 228): white/60 is 5.5:1 on the
  // footer field, gray-500 is 4.8:1 on white. white/30 and gray-400 were ~2.5:1.
  const inputClass = isDark
    ? 'border-white/10 bg-white/5 text-white placeholder-white/60 focus:border-white/30 focus:bg-white/10'
    : 'border-gray-300 bg-white text-[var(--color-dark)] placeholder-gray-500 focus:border-[var(--color-primary)]';

  return (
    <form action={formAction} className="w-full flex flex-col gap-3">
      {/* Honeypot field (p. 228 spam protection). Hidden from people and screen
          readers. `.honeypot` clips it in place: the old `left: -9999px` made
          ~10,000px of sideways scroll whenever the page ran right-to-left. */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Website</label>
        <input type="text" id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label htmlFor={`${id}-email`} className="sr-only">Email address</label>
      <input
        id={`${id}-email`}
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="you@organisation.com"
        aria-invalid={Boolean(state.errors?.email)}
        aria-describedby={state.message ? `${id}-status` : undefined}
        className={`flex-1 px-5 py-3.5 rounded-full border transition-colors ${inputClass}`}
        disabled={isPending}
      />

      {/* Unticked by default and required: consent must be an active choice. */}
      <div className="flex items-start gap-2.5">
        <input
          id={`${id}-consent`}
          type="checkbox"
          name="consent"
          required
          disabled={isPending}
          aria-invalid={Boolean(state.errors?.consent)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--color-primary)]"
        />
        <label
          htmlFor={`${id}-consent`}
          className={`text-xs leading-snug cursor-pointer ${isDark ? 'text-white/70' : 'text-gray-600'}`}
        >
          I agree to receive the Enerqa newsletter and have read the{' '}
          <Link href="/privacy" className={`underline font-semibold ${isDark ? 'text-white' : 'text-[var(--color-dark)]'}`}>
            Privacy Notice
          </Link>
          . I can unsubscribe at any time.
        </label>
      </div>

      <Button variant="primary" type="submit" className="w-full justify-center h-[52px]" disabled={isPending}>
        <span className="en">{isPending ? 'Subscribing...' : 'Subscribe'}</span>
        <span className="ar">{isPending ? 'جاري الاشتراك...' : 'اشترك'}</span>
      </Button>

      {/* role="alert" so a validation or delivery error is announced (p. 228). */}
      {state.message && (
        <div id={`${id}-status`} role="alert" className={`text-xs mt-1 px-2 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
          {state.message}
        </div>
      )}
    </form>
  );
}
