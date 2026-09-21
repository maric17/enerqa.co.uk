'use client'

import React, { useActionState } from 'react'
import { Container } from '../ui/Container'
import { submitNewsletterForm, NewsletterFormState } from '@/app/(frontend)/actions/newsletter'

const initialState: NewsletterFormState = {
  success: false,
}

export const ContactCTA = () => {
  const [state, formAction, isPending] = useActionState(submitNewsletterForm, initialState);

  return (
    <section className="band" id="cta" style={{ background: '#ffffff', padding: '60px 0 100px' }}>
      <Container>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>

          {/* H13 Discuss Your Project (Navy) */}
          <div style={{ position: 'relative', borderRadius: 'var(--r-sm)', overflow: 'hidden', background: 'var(--color-dark)', padding: '60px 48px', boxShadow: '0 20px 60px rgba(10, 25, 47, 0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.15em', display: 'block', marginBottom: '16px' }}>
              Project Enquiry
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 36px)', fontWeight: 300, color: '#ffffff', lineHeight: 1.15, margin: '0 0 16px', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              <span className="en">Discuss Your <span style={{ fontWeight: 800 }}>Project</span></span>
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: '0 0 32px', fontWeight: 300 }}>
              <span className="en">Share an idea, an investment opportunity or a challenge at any stage of development. An initial conversation can help define the evidence and support needed next.</span>
            </p>
            <a href="/contact?intent=project" className="btn client-hover-btn-submit" style={{ background: 'var(--color-primary)', color: 'var(--color-dark)', fontWeight: 700, textDecoration: 'none', border: 'none', borderRadius: '100px', padding: '13px 32px', fontSize: '13.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'transform 0.2s, box-shadow 0.2s', width: 'fit-content', boxShadow: '0 4px 16px rgba(0,207,200,0.15)' }}>
              <span>Discuss Your Project</span> 
              <svg style={{ width: '14px', height: '14px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </a>
          </div>

          {/* H12 Stay Informed (Teal) */}
          <div style={{ position: 'relative', borderRadius: 'var(--r-sm)', overflow: 'hidden', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)', padding: '60px 48px', boxShadow: '0 20px 60px rgba(0, 207, 200, 0.15)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-dark)', opacity: 0.8, letterSpacing: '0.15em', display: 'block', marginBottom: '16px' }}>
              Newsletter
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 36px)', fontWeight: 300, color: 'var(--color-dark)', lineHeight: 1.15, margin: '0 0 16px', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              <span className="en">Stay <span style={{ fontWeight: 800 }}>Informed</span></span>
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-dark)', opacity: 0.8, lineHeight: 1.6, margin: '0 0 32px', fontWeight: 400 }}>
              <span className="en">Receive Enerqa publications and selected updates on climate, energy, environment and sustainable business.</span>
            </p>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }} action={formAction}>
              {state.message && (
                <div style={{ background: state.success ? 'rgba(0,207,200,0.1)' : 'rgba(255,0,0,0.1)', color: state.success ? 'var(--color-primary-dark)' : 'red', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500 }}>
                  {state.message}
                </div>
              )}
              {/* Honeypot for spam protection */}
              <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                <input type="text" name="website" tabIndex={-1} autoComplete="off" />
              </div>
              
              {/* Input Row */}
              <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.97)', borderRadius: '100px', overflow: 'hidden', alignItems: 'center', width: '100%', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} className="cta-input-row">
                <input type="email" name="email" placeholder="* Your email address" required style={{ flex: 1, minWidth: 0, padding: '14px 24px', border: 'none', background: 'transparent', color: '#1c1c1c', fontSize: '14px', outline: 'none' }} disabled={state.success || isPending} />
                <button type="submit" disabled={state.success || isPending} className="btn" style={{ background: 'var(--color-dark)', color: '#ffffff', fontWeight: 700, border: 'none', borderRadius: '100px', padding: '14px 32px', fontSize: '13.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s', whiteSpace: 'nowrap', opacity: (state.success || isPending) ? 0.7 : 1 }}>
                  <span>{isPending ? 'Subscribing...' : 'Subscribe'}</span> 
                </button>
              </div>

              {/* Consent Checkbox */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '8px' }}>
                <input type="checkbox" id="consent" name="consent" required disabled={state.success || isPending} style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1.5px solid rgba(10,25,47,0.4)', background: 'transparent', accentColor: 'var(--color-dark)', cursor: 'pointer', marginTop: '2px' }} />
                <label htmlFor="consent" style={{ fontSize: '12px', color: 'rgba(10,25,47,0.7)', lineHeight: 1.45, cursor: 'pointer' }}>
                  I agree with the terms of the <a href="/privacy" style={{ color: 'var(--color-dark)', textDecoration: 'underline', fontWeight: 600 }}>Privacy Notice</a> and consent to my personal data being processed.
                </label>
              </div>
            </form>
          </div>

        </div>
      </Container>
      <style dangerouslySetInnerHTML={{__html: `
        .client-hover-btn-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,207,200,0.25) !important; }
        @media (max-width: 600px) {
          .cta-input-row { flex-direction: column; border-radius: 8px !important; }
          .cta-input-row input { width: 100%; box-sizing: border-box; border-bottom: 1px solid rgba(0,0,0,0.1); }
          .cta-input-row button { width: 100%; border-radius: 0 0 8px 8px !important; }
        }
      `}} />
    </section>
  )
}
