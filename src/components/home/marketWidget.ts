export const MARKET_SYMBOLS = [
  { s: 'NYSE:NEE', d: 'NextEra Energy' },
  { s: 'NASDAQ:FSLR', d: 'First Solar' },
  { s: 'NASDAQ:TSLA', d: 'Tesla' },
  { s: 'NYSE:XOM', d: 'Exxon Mobil' },
  { s: 'NYSE:SHEL', d: 'Shell' },
  { s: 'NASDAQ:MSFT', d: 'Microsoft' },
];

export const MARKET_WIDGET_MESSAGE = 'enerqa:market-widget';
const config = {
  colorTheme: 'light', dateRange: '1M', showChart: true, locale: 'en',
  width: '100%', height: '100%', isTransparent: false, showSymbolLogo: true,
  showFloatingTooltip: true, plotLineColorGrowing: '#087f73', plotLineColorFalling: '#b42318',
  gridLineColor: 'rgba(42, 46, 57, 0.06)', scaleFontColor: '#475569',
  iframeTitle: 'Company share prices, changes and market chart by TradingView',
  tabs: [{ title: 'Companies', symbols: MARKET_SYMBOLS, originalTitle: 'Stocks' }],
};

// A separate document gives the provider script the same lifetime as its iframe.
// All HTML and configuration are static; no visitor or CMS text is interpolated.
export const MARKET_WIDGET_DOCUMENT = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body,#market-widget{width:100%;height:100%;margin:0;overflow:hidden}iframe{display:block;border:0}</style>
</head><body><div id="market-widget" class="tradingview-widget-container">
<div class="tradingview-widget-container__widget"></div>
<script>
(() => {
  const notify = status => parent.postMessage({ type: '${MARKET_WIDGET_MESSAGE}', status }, '*');
  const root = document.getElementById('market-widget');
  const observer = new MutationObserver(() => {
    const frame = root.querySelector('iframe');
    if (!frame) return;
    observer.disconnect();
    frame.addEventListener('load', () => notify('ready'), { once: true });
  });
  observer.observe(root, { childList: true, subtree: true });
  window.addEventListener('error', event => {
    if (event.target && event.target.id === 'market-provider-script') notify('failed');
  }, true);
})();
</script>
<script id="market-provider-script" src="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js" async>
${JSON.stringify(config)}
</script></div></body></html>`;
