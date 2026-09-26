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
export const ContactCTA = () => {
  const [state, formAction, isPending] = useActionState(submitNewsletterForm, initialState);
  // useId keeps the label/input pairs unique even if this block is ever rendered twice.
  const emailId = useId();
  const consentId = useId();

  return (
    <section className="band" id="cta" style={{ background: '#ffffff', padding: '60px 0 100px' }}>
      <Container>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>

          {/* H12 Stay Informed (Teal) */}
          <div style={{ position: 'relative', borderRadius: 'var(--r-sm)', overflow: 'hidden', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)', padding: '60px 48px', boxShadow: '0 20px 60px rgba(0, 207, 200, 0.15)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h2" className="home-h2 mb-4 text-[var(--color-dark)]">
              <span className="en">Stay Informed</span>
            </Typography>
            <p style={{ fontSize: '15px', color: 'var(--color-dark)', opacity: 0.8, lineHeight: 1.6, margin: '0 0 32px', fontWeight: 400 }}>
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
              <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.97)', borderRadius: '100px', overflow: 'hidden', alignItems: 'center', width: '100%', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} className="cta-input-row">
                {/* p. 228: a real label, not just the placeholder. */}
                <label htmlFor={emailId} className="sr-only">Email address (required)</label>
                <input id={emailId} type="email" name="email" autoComplete="email" placeholder="* Your email address" required style={{ flex: 1, minWidth: 0, padding: '14px 24px', border: 'none', background: 'transparent', color: '#1c1c1c', fontSize: '14px' }} disabled={state.success || isPending} />
                <button type="submit" disabled={state.success || isPending} className="btn" style={{ background: 'var(--color-dark)', color: '#ffffff', fontWeight: 700, border: 'none', borderRadius: '100px', padding: '14px 32px', fontSize: '13.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s', whiteSpace: 'nowrap', opacity: (state.success || isPending) ? 0.7 : 1 }}>
                  <span>{isPending ? 'Subscribing…' : 'Subscribe'}</span>
                </button>
              </div>

              {/* Consent Checkbox */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '8px' }}>
                <input type="checkbox" id={consentId} name="consent" required disabled={state.success || isPending} style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1.5px solid rgba(10,25,47,0.4)', background: 'transparent', accentColor: 'var(--color-dark)', cursor: 'pointer', marginTop: '2px' }} />
                <label htmlFor={consentId} style={{ fontSize: '12px', color: 'rgba(10,25,47,0.7)', lineHeight: 1.45, cursor: 'pointer' }}>
                  I agree with the terms of the <a href="/privacy" style={{ color: 'var(--color-dark)', textDecoration: 'underline', fontWeight: 600 }}>Privacy Notice</a> and consent to my personal data being processed.
                </label>
              </div>
            </form>
          </div>

          {/* H13 Discuss Your Project (Navy) */}
          <div style={{ position: 'relative', borderRadius: 'var(--r-sm)', overflow: 'hidden', background: 'var(--color-dark)', padding: '60px 48px', boxShadow: '0 20px 60px rgba(10, 25, 47, 0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h2" className="home-h2 mb-4 text-white">
              <span className="en">Discuss Your Project</span>
            </Typography>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: '0 0 32px', fontWeight: 300 }}>
              <span className="en">Share an idea, an investment opportunity or a challenge at any stage of development. An initial conversation can help define the evidence and support needed next.</span>
            </p>
            <a href="/contact?intent=project" className="btn client-hover-btn-submit" style={{ background: 'var(--color-primary)', color: 'var(--color-dark)', fontWeight: 700, textDecoration: 'none', border: 'none', borderRadius: '100px', padding: '13px 32px', fontSize: '13.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'transform 0.2s, box-shadow 0.2s', width: 'fit-content', boxShadow: '0 4px 16px rgba(0,207,200,0.15)' }}>
              <span>Discuss Your Project</span>
              <svg aria-hidden="true" style={{ width: '14px', height: '14px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </a>
          </div>

        </div>
      </Container>
      <style dangerouslySetInnerHTML={{__html: `
        .client-hover-btn-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,207,200,0.25) !important; }
        /* Visible keyboard focus (p. 228). The ring sits inside the rounded row,
           which clips anything drawn outside it. */
        .cta-input-row input:focus-visible { outline: 2px solid var(--color-dark); outline-offset: -4px; border-radius: 100px; }
        @media (max-width: 600px) {
          .cta-input-row { flex-direction: column; border-radius: 8px !important; }
          .cta-input-row input { width: 100%; box-sizing: border-box; border-bottom: 1px solid rgba(0,0,0,0.1); }
          .cta-input-row button { width: 100%; border-radius: 0 0 8px 8px !important; }
        }
      `}} />
    </section>
  )
}
