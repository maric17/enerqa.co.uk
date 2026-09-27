'use client'

import React, { useActionState, useId } from 'react'
import { Container } from '../ui/Container'
import { submitNewsletterForm, NewsletterFormState } from '@/app/(frontend)/actions/newsletter'
import { Typography } from '../ui/Typography'

const initialState: NewsletterFormState = {
  success: false,
}

/**
 * H12 Stay Informed + H13 Discuss Your Project (handoff p. 15), in the order
 * the spec lists them: H12 first.
 *
 * p. 228: labelled form controls and visible keyboard focus. The email field
 * has a real (visually hidden) label, and the input row shows a focus ring
 * instead of suppressing the outline.
 */
// privacyHref is set only while the Privacy Notice is published (p. 4: no fake links).
export const ContactCTA = ({ privacyHref }: { privacyHref?: string }) => {
  const [state, formAction, isPending] = useActionState(submitNewsletterForm, initialState);
  // useId keeps the label/input pairs unique even if this block is ever rendered twice.
  const emailId = useId();
  const consentId = useId();

  return (
    <section className="band bg-slate-900" id="cta" style={{ padding: '80px 0 120px' }}>
      <Container>
        <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-[32px] p-8 lg:p-16 border border-white/10 overflow-hidden">
          <div className="absolute -top-[100px] -left-[100px] w-[400px] h-[400px] bg-teal-400/20 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="absolute -bottom-[100px] -right-[100px] w-[400px] h-[400px] bg-sky-400/20 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', position: 'relative', zIndex: 10 }}>

          {/* H12 Stay Informed (Teal) */}
          <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 lg:p-12 flex flex-col justify-center transition-all hover:-translate-y-1 hover:border-teal-400/30">
            <Typography variant="h2" className="home-h2 mb-4 bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent">
              <span className="en">Stay Informed</span>
            </Typography>
            <p className="text-[15px] text-white/70 leading-relaxed mb-8 font-light">
              <span className="en">Receive Enerqa publications and selected updates on climate, energy, environment and sustainable business.</span>
            </p>

            <form style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }} action={formAction}>
              {/* role="status" so the result is announced, not only shown. */}
              <div role="status" aria-live="polite">
                {state.message && (
                  <div style={{ background: state.success ? 'rgba(0,207,200,0.1)' : 'rgba(255,0,0,0.1)', color: state.success ? 'var(--color-primary-dark)' : 'red', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500 }}>
                    {state.message}
                  </div>
                )}
              </div>
              {/* Honeypot for spam protection */}
              <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                <input type="text" name="website" tabIndex={-1} autoComplete="off" />
              </div>

              {/* Input Row */}
              <div className="cta-input-row flex bg-white/5 border border-white/10 rounded-full overflow-hidden items-center w-full shadow-lg transition-colors focus-within:border-teal-400/50 focus-within:bg-white/10">
                <label htmlFor={emailId} className="sr-only">Email address (required)</label>
                <input id={emailId} type="email" name="email" autoComplete="email" placeholder="* Your email address" required className="flex-1 min-w-0 py-3.5 px-6 border-none bg-transparent text-white text-[15px] outline-none placeholder:text-white/40" disabled={state.success || isPending} />
                <button type="submit" disabled={state.success || isPending} className="bg-teal-400 hover:bg-teal-500 text-teal-950 font-semibold border-none px-8 py-3.5 text-[14px] cursor-pointer flex items-center gap-2 transition-colors whitespace-nowrap disabled:opacity-70">
                  <span>{isPending ? 'Subscribing…' : 'Subscribe'}</span>
                </button>
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start gap-3 mt-4">
                <input type="checkbox" id={consentId} name="consent" required disabled={state.success || isPending} className="mt-1 w-4 h-4 rounded bg-transparent border border-white/30 accent-teal-400 cursor-pointer" />
                <label htmlFor={consentId} className="text-[13px] text-white/50 leading-relaxed cursor-pointer">
                  {privacyHref ? (
                    <>I agree with the terms of the <a href={privacyHref} className="text-teal-400 underline decoration-teal-400/30 font-medium hover:text-teal-300">Privacy Notice</a> and consent to my personal data being processed.</>
                  ) : (
                    <>I agree to receive the Enerqa newsletter. I can unsubscribe at any time.</>
                  )}
                </label>
              </div>
            </form>
          </div>

          {/* H13 Discuss Your Project (Navy) */}
          <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 lg:p-12 flex flex-col justify-center transition-all hover:-translate-y-1 hover:border-sky-400/30">
            <Typography variant="h2" className="home-h2 mb-4 bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              <span className="en">Discuss Your Project</span>
            </Typography>
            <p className="text-[15px] text-white/70 leading-relaxed mb-8 font-light">
              <span className="en">Share an idea, an investment opportunity or a challenge at any stage of development. An initial conversation can help define the evidence and support needed next.</span>
            </p>
            <a href="/contact?intent=project" className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold no-underline px-8 py-3.5 rounded-full text-[14px] w-fit transition-all hover:bg-white/20 hover:border-sky-400 hover:text-sky-300">
              <span>Discuss Your Project</span>
              <svg aria-hidden="true" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </a>
          </div>

          </div>
        </div>
      </Container>
    </section>
  )
}
