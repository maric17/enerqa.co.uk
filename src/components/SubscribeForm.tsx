'use client';

import React from 'react';

export default function SubscribeForm() {
  return (
    <form onSubmit={(e) => e.preventDefault()} style={{ maxWidth: 460, margin: '28px auto 0', display: 'flex', gap: 10 }}>
      <input type="email" placeholder="you@organisation.com" style={{ flex: 1, padding: '14px 16px', borderRadius: 999, border: '1px solid var(--line-dark)', background: 'rgba(255,255,255,.05)', color: '#fff' }} />
      <button className="btn on-dark"><span className="en">Subscribe</span><span className="ar">اشترك</span></button>
    </form>
  );
}
