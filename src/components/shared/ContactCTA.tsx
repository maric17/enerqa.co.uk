'use client'

import React from 'react'
import { Container } from '../ui/Container'

export const ContactCTA = () => {
  return (
    <section className="band" id="cta" style={{ background: '#ffffff', padding: '60px 0 100px' }}>
      <Container>
        <div style={{ position: 'relative', borderRadius: 'var(--r-sm)', overflow: 'hidden', background: 'linear-gradient(135deg, #8B1538 0%, #4a071a 100%)', padding: '80px 60px', boxShadow: '0 20px 60px rgba(139,21,56,0.2)', display: 'flex', alignItems: 'center', gap: '48px', justifyContent: 'space-between', flexWrap: 'wrap' }}>

          {/* Subtle maroon texture overlay */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.04) 0%, transparent 60%)', zIndex: 0, pointerEvents: 'none' }}>
          </div>

          {/* Left Column: Headings */}
          <div style={{ position: 'relative', zIndex: 2, flex: 1, minWidth: '280px', maxWidth: '460px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.15em', display: 'block', marginBottom: '16px' }}>
              Newsletter
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 300, color: '#ffffff', lineHeight: 1.15, margin: '0 0 16px', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              <span className="en">Stay up to <span style={{ fontWeight: 800 }}>date</span></span>
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: 0, fontWeight: 300 }}>
              <span className="en">Subscribe to receive our latest insights, technical publications, advisory notes, and
                tools directly to your inbox.</span>
            </p>
          </div>

          {/* Right Column: Input Form */}
          <div style={{ position: 'relative', zIndex: 2, flex: 1.2, minWidth: '320px', maxWidth: '560px' }}>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }} onSubmit={(e) => e.preventDefault()}>

              {/* Input Row */}
              <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.97)', borderRadius: 'var(--r-sm)', overflow: 'hidden', alignItems: 'center', width: '100%', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }} className="cta-input-row">
                <input type="email" placeholder="* Your email address" required style={{ flex: 1.2, minWidth: 0, padding: '14px 24px', border: 'none', background: 'transparent', color: '#1c1c1c', fontSize: '14px', outline: 'none', borderRight: '1px solid rgba(139,21,56,0.12)' }} />
                <input type="text" placeholder="First name" style={{ flex: 0.8, minWidth: 0, padding: '14px 24px', border: 'none', background: 'transparent', color: '#1c1c1c', fontSize: '14px', outline: 'none' }} />
              </div>

              {/* Consent Checkbox */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '4px' }}>
                <input type="checkbox" id="consent" required style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1.5px solid rgba(255,255,255,0.4)', background: 'transparent', accentColor: '#ffffff', cursor: 'pointer', marginTop: '2px' }} />
                <label htmlFor="consent" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.45, cursor: 'pointer' }}>
                  I agree with the terms of the <a href="/privacy" style={{ color: '#ffffff', textDecoration: 'underline', fontWeight: 600 }}>Privacy Notice</a> and
                  consent to my personal data being processed to subscribe to updates.
                </label>
              </div>

              {/* Sign Up Button */}
              <button type="submit" className="btn client-hover-btn-submit" style={{ background: '#ffffff', color: '#8B1538', fontWeight: 700, border: 'none', borderRadius: 'var(--r-sm)', padding: '13px 32px', fontSize: '13.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s, color 0.2s', whiteSpace: 'nowrap', width: 'fit-content', marginTop: '4px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                <span>Sign Up</span> 
                <svg style={{ width: '14px', height: '14px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              </button>

            </form>
          </div>

        </div>
        </Container>
      <style dangerouslySetInnerHTML={{__html: `
        .client-hover-btn-submit:hover { background: #f3e8ea !important; color: #72102d !important; }
        @media (max-width: 600px) {
          .cta-input-row { flex-direction: column; }
          .cta-input-row input { width: 100%; box-sizing: border-box; }
          .cta-input-row input[type="email"] { border-right: none !important; border-bottom: 1px solid rgba(139,21,56,0.12) !important; }
        }
      `}} />
    </section>
  )
}
