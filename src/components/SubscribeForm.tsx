'use client';

import React, { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { submitNewsletterForm, NewsletterFormState } from '@/app/(frontend)/actions/newsletter';

const initialState: NewsletterFormState = {
  success: false,
};

export default function SubscribeForm() {
  const [state, formAction, isPending] = useActionState(submitNewsletterForm, initialState);

  if (state.success) {
    return (
      <div className="w-full p-4 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/25 text-[var(--color-primary)] text-sm text-center">
        Thank you for subscribing!
      </div>
    );
  }

  return (
    <form action={formAction} className="w-full flex flex-col gap-3">
      {/* Honeypot field */}
      <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-3">
        <input 
          type="email" 
          name="email"
          required
          placeholder="you@organisation.com" 
          className="flex-1 px-5 py-3.5 rounded-full border border-white/10 bg-white/5 text-white placeholder-white/30 outline-none focus:border-white/30 focus:bg-white/10 transition-colors" 
          disabled={isPending}
        />
        <Button variant="primary" type="submit" className="w-full justify-center h-[52px]" disabled={isPending}>
          <span className="en">{isPending ? 'Subscribing...' : 'Subscribe'}</span>
          <span className="ar">{isPending ? 'جاري الاشتراك...' : 'اشترك'}</span>
        </Button>
      </div>
      
      {state.success === false && state.message && (
        <div className="text-red-400 text-xs mt-1 px-2">{state.message}</div>
      )}
    </form>
  );
}
