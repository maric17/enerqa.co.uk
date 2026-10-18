'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChartNoAxesCombined, ArrowUpRight } from 'lucide-react';
import { useEmbedConsent } from '@/lib/consent';
import { Button } from '../ui/Button';

import { MARKET_WIDGET_DOCUMENT, MARKET_WIDGET_MESSAGE } from './marketWidget';

export { MARKET_SYMBOLS } from './marketWidget';
const CHART_URL = 'https://www.tradingview.com/symbols/NYSE-NEE/';

function TradingViewChart() {
  const frame = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setStatus(current => current === 'loading' ? 'failed' : current);
    }, 20000);
    const receiveStatus = (event: MessageEvent) => {
      // Only this document may report readiness; unrelated frames cannot hide errors.
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      if (event.data?.type !== MARKET_WIDGET_MESSAGE || !['ready', 'failed'].includes(event.data.status)) return;
      window.clearTimeout(timeout);
      setStatus(event.data.status);
    };
    window.addEventListener('message', receiveStatus);
    return () => {
      window.removeEventListener('message', receiveStatus);
      window.clearTimeout(timeout);
    };
  }, []);

  return <div className="market-chart-loaded">
    {status !== 'ready' && <div className="market-chart-status" role="status">
      {status === 'failed' ? <>The market chart could not be loaded. <a href={CHART_URL} target="_blank" rel="noopener noreferrer">Open the source chart</a></> : 'Loading market prices and chart…'}
    </div>}
    {/* Removing this frame cancels its pending scripts and child-frame listeners. */}
    <div className="market-chart-host" data-market-widget>
      <iframe ref={frame} srcDoc={MARKET_WIDGET_DOCUMENT}
        title="Company share prices, changes and market chart by TradingView"
        referrerPolicy="strict-origin-when-cross-origin" />
    </div>
  </div>;
}

/** The existing embed preference applies; a click can also load this visit only. */
export function MarketChart() {
  const consent = useEmbedConsent();
  const [loadThisVisit, setLoadThisVisit] = useState(false);
  const allowed = consent || loadThisVisit;
  return <div className="market-chart">
    <div className="market-chart-frame">
      {allowed ? <TradingViewChart /> : <div className="market-chart-consent">
        <ChartNoAxesCombined aria-hidden="true" />
        <h4>Explore company shares</h4>
        <p>View prices, daily changes and a price chart for energy, transition and technology companies.</p>
        <p className="market-chart-privacy">The chart is hosted by TradingView and may use its own cookies. Load it when you’re ready.</p>
        <Button type="button" onClick={() => setLoadThisVisit(true)}>Load market chart</Button>
      </div>}
    </div>
    {/* Keep the provider's attribution and source link beside the free widget. */}
    <div className="market-chart-credit"><a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer">Track all markets on TradingView</a>
      <a href={CHART_URL} target="_blank" rel="noopener noreferrer">Open chart <ArrowUpRight aria-hidden="true" /></a></div>
  </div>;
}
