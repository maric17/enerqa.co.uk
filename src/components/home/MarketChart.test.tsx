import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { saveConsent } from '@/lib/consent';
import { MarketChart, MARKET_SYMBOLS } from './MarketChart';
import { MARKET_WIDGET_MESSAGE } from './marketWidget';

beforeEach(() => localStorage.clear());

function widgetStatus(frame: HTMLIFrameElement, status: string, source: MessageEventSource | null = frame.contentWindow, origin = window.location.origin) {
  act(() => window.dispatchEvent(new MessageEvent('message', {
    source, origin, data: { type: MARKET_WIDGET_MESSAGE, status },
  })));
}

describe('free market widget privacy and failure states', () => {
  it('makes no third-party request before consent or a load click', () => {
    const { container } = render(<MarketChart />);
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.getByRole('button', { name: 'Load market chart' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Track all markets on TradingView' })).toBeInTheDocument();
  });

  it('keeps the provider loader inside its iframe document, including Strict Mode', () => {
    const { container } = render(<StrictMode><MarketChart /></StrictMode>);
    fireEvent.click(screen.getByRole('button', { name: 'Load market chart' }));
    const frame = container.querySelector('iframe')!;
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelectorAll('iframe')).toHaveLength(1);
    const document = new DOMParser().parseFromString(frame.srcdoc, 'text/html');
    const script = document.getElementById('market-provider-script')!;
    expect(script.getAttribute('src')).toBe('https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js');
    const config = JSON.parse(script.textContent!);
    expect(config.showChart).toBe(true);
    expect(config.tabs[0].symbols).toEqual(MARKET_SYMBOLS);
  });

  it('offers a source link if the provider reports a load failure', () => {
    const { container } = render(<MarketChart />);
    fireEvent.click(screen.getByRole('button', { name: 'Load market chart' }));
    widgetStatus(container.querySelector('iframe')!, 'failed');
    expect(screen.getByRole('status')).toHaveTextContent('The market chart could not be loaded.');
    expect(screen.getByRole('link', { name: 'Open the source chart' })).toHaveAttribute('href', 'https://www.tradingview.com/symbols/NYSE-NEE/');
  });

  it('removes the browsing context when global consent is withdrawn', () => {
    saveConsent({ embeds: true });
    const { container } = render(<MarketChart />);
    expect(container.querySelector('iframe')).not.toBeNull();
    act(() => saveConsent({ embeds: false }));
    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.getByRole('button', { name: 'Load market chart' })).toBeInTheDocument();
  });

  it('ignores unrelated, foreign-origin and malformed frame messages', () => {
    saveConsent({ embeds: true });
    const { container } = render(<MarketChart />);
    const frame = container.querySelector('iframe')!;
    widgetStatus(frame, 'ready', window);
    widgetStatus(frame, 'ready', frame.contentWindow, 'https://unrelated.example');
    widgetStatus(frame, 'unknown');
    expect(screen.getByRole('status')).toHaveTextContent('Loading market prices');
    widgetStatus(frame, 'ready');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
