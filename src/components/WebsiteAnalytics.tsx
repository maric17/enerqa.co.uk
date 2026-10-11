'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { analyticsAllowed, useAnalyticsConsent } from '@/lib/consent';
import { analyticsPath, safeAnalyticsPayload } from '@/lib/analytics/privacy';

declare global {
  interface Window {
    umami?: { track: (event?: string) => void };
    enerqaBeforeAnalytics?: (type: string, payload: Record<string, unknown>) => unknown;
  }
}

export function WebsiteAnalytics({ scriptUrl, websiteId }: { scriptUrl?: string; websiteId?: string }) {
  const allowed = useAnalyticsConsent();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // The installed tracker can outlive consent. Check the choice before EVERY send.
    window.enerqaBeforeAnalytics = (type, payload) => type === 'event' && analyticsAllowed() && websiteId
      ? safeAnalyticsPayload(payload, window.location.pathname, websiteId) : false;
    return () => { window.enerqaBeforeAnalytics = () => false; };
  }, [websiteId]);

  useEffect(() => {
    if (!allowed || !ready || !analyticsPath(pathname)) return;
    window.umami?.track();
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element)?.closest?.('a');
      if (!anchor || !analyticsAllowed()) return;
      const target = new URL(anchor.href, window.location.origin);
      if (pathname.startsWith('/data-portal') && (anchor.hasAttribute('download') || target.pathname === '/api/data-portal/dataset' || /\.(?:csv|xlsx|zip|json)$/.test(target.pathname))) window.umami?.track('dataset_download');
      if (pathname.startsWith('/tools/') && (anchor.hash === '#access' || target.pathname === '/contact' || target.origin !== window.location.origin || anchor.hasAttribute('download'))) window.umami?.track('tool_access');
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [allowed, ready, pathname]);

  if (!allowed || !scriptUrl || !websiteId || !analyticsPath(pathname)) return null;
  return <Script id="enerqa-umami" src={scriptUrl} strategy="afterInteractive" data-website-id={websiteId}
    data-auto-track="false" data-exclude-search="true" data-exclude-hash="true" data-do-not-track="true"
    data-before-send="enerqaBeforeAnalytics" onReady={() => setReady(true)} />;
}
