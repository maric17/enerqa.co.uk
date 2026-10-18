# Major Markets — 18 October 2026

The user chose to keep the full-screen hero and place Major Markets directly below it. This supersedes fitting both into the first screen. Markets is removed from the hero selector; its four domain categories remain.

## Implemented free version

- A separate Major Markets section. At the reference desktop sizes, the hero and market section have equal screen-height footprints. Mobile can grow with its content.
- A wider market-data column with TradingView's free Market Overview widget. It shows a real price chart, company symbols, share prices, absolute daily changes and percentage changes.
- Initial U.S.-listed shares: NEE, FSLR, TSLA, XOM, SHEL and MSFT. Selected share prices and absolute changes are in USD, rather than index points. These companies can be changed when the client supplies a preferred watchlist.
- A separate commentary column with eligible saved news and U.S. EIA reporting. Publication, retrieval and cache labels remain visible. Reporting is broader market context and does not claim to explain the selected stock's movement.
- The columns align on desktop and stack on mobile. Only teasers may be shortened; headlines and source metadata remain readable.
- The chart makes no third-party request before embedded-content consent or a Load market chart click. Global consent withdrawal removes the widget. A blocked script offers an honest failure message and the original chart link.
- TradingView branding, attribution and source links remain visible. Quotes are labelled delayed; the Sources page explains coverage and the display-only boundary. No prices are copied into Data Portal downloads.

TradingView's free widget cost is USD 0/month. NYSE/Nasdaq widget stock data is delayed Cboe One data, not a verified real-time exchange feed. Sources: [free widgets](https://www.tradingview.com/widget/), [available U.S. markets](https://www.tradingview.com/widget-docs/markets/north-america/), [data FAQ](https://www.tradingview.com/widget-docs/faq/data/).

## Paid upgrade proposal

The [updated API comparison](API-RECOMMENDATIONS.md#free-market-display-selected--18-october-2026) includes Twelve Data Venture, EODHD Enterprise/custom and optional Marketaux commentary. Twelve Data advertises a USD 149 starting point and displays a USD 499 configuration; the latter plus Marketaux Basic is an illustrative USD 528/month before taxes and exchange charges. Existing commentary avoids that optional USD 29/month subscription. Exact public-display rights, exchanges and refresh allowances must be settled in the selected quote. No paid service was activated.

## Evidence and follow-up

Verified locally:

- 577 tests across 77 files; TypeScript, changed-code ESLint and whitespace checks pass.
- Production build passes with `PAYLOAD_SCHEMA_PUSH=false`.
- The production build's actual TradingView data and chart pass at 1366×768, 1024×768, 390×844 and 320×740. The checks confirm real prices, signed daily changes, no horizontal page overflow, zero browser exceptions, consent withdrawal and blocked-script fallback. Hero and market sections have equal heights at both desktop sizes.
- Hero navigation/search pass at seven screen sizes with exactly four domain categories.
- Native market-section text contrast samples are at least 4.83:1. This covers Enerqa's own text and controls, not the separately hosted widget's presentation.
- The production Sources page renders the new market-data notes, delay disclosure and consent link.

Evidence: [production market checks](major-markets-verification.json), [native contrast samples](major-markets-native-contrast.json), [hero checks](hero-verification.json), [desktop markets](screenshots/major-markets-1366.png), [mobile markets](screenshots/major-markets-390.png).

Repeat the market checks with `scripts/verify-major-markets.mjs`; it accepts `PLAYWRIGHT_MODULE`, `CHROME_EXECUTABLE` and `FEEDBACK_PREVIEW_URL`. The report records the tested origin. Public deployment is separate from this locally verified implementation. Changing the watchlist or upgrading to a paid quote API remains a subsequent provider decision; current free chart display needs no API key.

## Iframe loading fix — 18 October 2026

The reported `Cannot listen to the event from the provided iframe, contentWindow is not available` message came from TradingView's loader executing after its parent widget was removed. Holding the actual loader response, withdrawing consent, then releasing the response reproduced the exact console error before the fix. Earlier checks captured browser exceptions but did not catch this console-only message.

The loader now runs inside an iframe document owned by the chart. Removing that document cancels its pending scripts and child-frame listeners. React manages the outer iframe directly; no provider script is appended to the homepage during an effect. Loading/failure messages are accepted only from that iframe and the current site origin. Consent and source links are retained.

Regression evidence: [delayed loader after consent withdrawal and navigation](market-widget-lifecycle-verification.json). Both scenarios pass without iframe errors or browser exceptions. [The updated market browser checks](major-markets-verification.json) also pass real quote/chart rendering at four desktop/mobile sizes and the blocked-script fallback. The verifier now captures the reported console error explicitly. Homepage/component tests pass (55 tests), with TypeScript, changed-code ESLint and the production build also passing.
