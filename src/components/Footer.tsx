import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="site" style={{ background: '#0f2841', color: '#ffffff', padding: '60px 0 40px', borderTop: '1px solid rgba(255,255,255,0.08)', fontFamily: 'var(--sans)' }}>
      <div className="wrap">
        {/* Top Row: Logo, Sister Brands, Socials */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            {/* Logo Image */}
            <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
              <img src="/assets/images/logo-white.png" alt="enerQA Logo" style={{ height: 38, width: 'auto', display: 'block' }} />
            </Link>
            {/* Vertical Line */}
            <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.15)', display: 'inline-block' }}></div>
            {/* Sister Brands */}
            <div style={{ display: 'flex', gap: 16, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', flexWrap: 'wrap' }}>
              <Link href="/services#climate" style={{ transition: 'color 0.2s', textDecoration: 'none', color: 'rgba(255,255,255,0.8)' }}>Climate Change</Link>
              <Link href="/services#environment" style={{ transition: 'color 0.2s', textDecoration: 'none', color: 'rgba(255,255,255,0.8)' }}>Environment &amp; ESG</Link>
              <Link href="/services#energy" style={{ transition: 'color 0.2s', textDecoration: 'none', color: 'rgba(255,255,255,0.8)' }}>Energy</Link>
              <Link href="/services#business" style={{ transition: 'color 0.2s', textDecoration: 'none', color: 'rgba(255,255,255,0.8)' }}>Business Solutions</Link>
            </div>
          </div>
          {/* Socials */}
          <div style={{ display: 'flex', gap: 8 }}>
            <a href="https://facebook.com/enerqa" target="_blank" rel="noopener noreferrer" style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, transition: 'background 0.3s', color: '#ffffff', textDecoration: 'none' }}>f</a>
            <a href="https://x.com/enerqa" target="_blank" rel="noopener noreferrer" style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, transition: 'background 0.3s', color: '#ffffff', textDecoration: 'none' }}>𝕏</a>
            <a href="https://linkedin.com/company/enerqa" target="_blank" rel="noopener noreferrer" style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, transition: 'background 0.3s', color: '#ffffff', textDecoration: 'none' }}>in</a>
            <a href="https://youtube.com/enerqa" target="_blank" rel="noopener noreferrer" style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, transition: 'background 0.3s', color: '#ffffff', textDecoration: 'none' }}>yt</a>
          </div>
        </div>

        {/* Middle Row: Grid Lists */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, padding: '48px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {/* Col 1 */}
          <div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, listStyle: 'none', padding: 0, margin: 0 }}>
              <li><Link href="/about" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s', textDecoration: 'none' }}>Who we are</Link></li>
              <li><Link href="/insights" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s', textDecoration: 'none' }}>News &amp; Insights</Link></li>
              <li><Link href="/contact#careers" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s', textDecoration: 'none' }}>Careers</Link></li>
              <li><Link href="/contact" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s', textDecoration: 'none' }}>Contacts</Link></li>
            </ul>
          </div>
          {/* Col 2 */}
          <div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, listStyle: 'none', padding: 0, margin: 0 }}>
              <li><Link href="/services" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s', textDecoration: 'none' }}>Services Overview</Link></li>
              <li><Link href="/projects" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s', textDecoration: 'none' }}>Projects &amp; Operations</Link></li>
              <li><Link href="/knowledge-hub" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s', textDecoration: 'none' }}>Research &amp; Publications</Link></li>
            </ul>
          </div>
          {/* Col 3 */}
          <div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, listStyle: 'none', padding: 0, margin: 0 }}>
              <li><Link href="/knowledge-hub#tools" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s', textDecoration: 'none' }}>Interactive Tools</Link></li>
              <li><Link href="/about#approach" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s', textDecoration: 'none' }}>Our Approach</Link></li>
              <li><Link href="/team" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s', textDecoration: 'none' }}>Experts &amp; Team</Link></li>
            </ul>
          </div>
          {/* Col 4 (Call to Action) */}
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
            <h5 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#ffffff', margin: 0, lineHeight: 1.35, maxWidth: '24ch' }}>
              STAY CURRENT WITH OUR LATEST DATA &amp; INSIGHTS
            </h5>
            <Link href="/contact" className="btn" style={{ background: '#ffffff', color: '#0f2841', fontWeight: 700, borderRadius: 100, padding: '12px 32px', fontSize: 13.5, border: 'none', width: 'fit-content', textAlign: 'center', display: 'inline-block', textDecoration: 'none' }}>
              Sign Up
            </Link>
          </div>
        </div>

        {/* Bottom Row: Copyright & Legal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 32, flexWrap: 'wrap', gap: 24, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#06322b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: 14 }}>
              ♿
            </div>
            <span>© 2026 enerQA Ltd. All Rights Reserved.</span>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/contact" style={{ transition: 'color 0.2s', textDecoration: 'none', color: 'rgba(255,255,255,0.5)' }}>Legal</Link>
            <Link href="/contact" style={{ transition: 'color 0.2s', textDecoration: 'none', color: 'rgba(255,255,255,0.5)' }}>Privacy Notice</Link>
            <Link href="/contact" style={{ transition: 'color 0.2s', textDecoration: 'none', color: 'rgba(255,255,255,0.5)' }}>Site Accessibility</Link>
            <Link href="/contact" style={{ transition: 'color 0.2s', textDecoration: 'none', color: 'rgba(255,255,255,0.5)' }}>Access to Information</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
