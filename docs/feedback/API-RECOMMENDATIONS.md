# News and market APIs — decision brief

Checked **15 October 2026** for WF-05–WF-08 and WF-11. Prices below are published list prices, before taxes and any exchange licences. These are research recommendations; no subscription, provider switch or paid call was activated.

## Recommendation

Trial **The News API** for the general news feed and **Exa** for targeted discovery. The former has a published USD 19/month entry plan; Exa can fit the USD 10–20 target with scheduled metadata-only searches. Evaluate actual topic coverage, publication-date accuracy and usable images before selecting either. Neither an image URL nor a search subscription establishes permission to republish the underlying photograph. [The News API pricing](https://www.thenewsapi.com/pricing), [Exa pricing](https://exa.ai/pricing).

For stock quotes, obtain a commercial display quote from **Twelve Data** first, using a specific list of companies/exchanges. Its displayed Venture configuration is USD 499/month; the same page also advertises a lower “from USD 149” configuration, so a confirmed plan/exchange quote is necessary. Pair it with sourced market commentary rather than presenting sentiment scores as editorial analysis. [Twelve Data business pricing](https://twelvedata.com/pricing-business).

## News shortlist

| Option | Published cost and limits | Fit for Enerqa | What to confirm before activation |
| --- | --- | --- | --- |
| The News API Basic | USD 19/month; 2,500 requests/day; up to 25 articles/request; advertised real-time access. | Keyword/Boolean queries, publication-date filters, publisher selection and supplied image URLs suit a conventional topic feed. | Public commercial display, required attribution, storage and image permissions need explicit clarification: the published general terms contain personal/non-commercial restrictions. |
| Exa Auto/Fast Search | USD 7/1,000 requests for up to 10 results; content extraction and other extras are priced separately. | News category, semantic queries and publication-date constraints support Enerqa's four domains. Result metadata includes an image field, but image resolution/completeness is not guaranteed. | Test discovery lag and date accuracy; retain original publisher links. Establish the intended display rights and a firm usage cap. |
| GNews Essential | EUR 49.99/month; 1,000 requests/day; up to 25 articles/request; commercial production use and real-time availability advertised. | A more conventional production news API if the budget increases. | Topic relevance, usable image sizes and publisher image rights. Above the requested budget. |
| Existing NewsData free feed | No subscription cost; documented 12-hour delay. | Retains the existing integration, but neither the built-in delay nor the current upstream failures meets the desired freshness. | Restore successful scheduled requests before evaluating whether its coverage is sufficient. Paid plans are outside the proposed small budget. |

Sources: [The News API pricing](https://www.thenewsapi.com/pricing), [documentation](https://www.thenewsapi.com/documentation), [terms](https://www.thenewsapi.com/tos); [Exa pricing](https://exa.ai/pricing), [Search API](https://exa.ai/docs/reference/search), [terms](https://exa.ai/assets/Exa_Labs_Terms_of_Service.pdf); [GNews pricing](https://gnews.io/pricing); [NewsData free-plan description](https://newsdata.io/blog/best-news-api-comparison-2/).

### Is Exa legitimate, and would we recommend it?

Exa is an identifiable API service with public documentation, pricing and contractual terms naming Exa Labs, Inc. That supports treating it as a real candidate. It does not establish that its results meet this site's editorial or image requirements. Recommend a bounded trial for discovery, followed by comparison with a conventional news feed. Do not treat it as an exchange quote feed or enable the deferred generated-answer feature as part of this work. [Exa terms](https://exa.ai/assets/Exa_Labs_Terms_of_Service.pdf), [Search API](https://exa.ai/docs/reference/search).

**Illustrative Exa budget:** four domain queries every two hours, for 30 days, produce 1,440 searches. At USD 7/1,000, base search cost is **USD 10.08/month**. Fetching ten pages of content for every search would add USD 14.40 at USD 1/1,000 pages per content type, exceeding USD 20 combined. Start with result metadata; avoid full text, generated summaries, deep searches and monitors in that estimate. Budget controls must cover retries and interactive searches too. [Exa pricing](https://exa.ai/pricing).

The News API's 100-request/day free allowance can support a small four-query trial at two-hour intervals (48 requests/day). This is a coverage experiment, subject to its terms, rather than approval to use it commercially. [Pricing](https://www.thenewsapi.com/pricing), [terms](https://www.thenewsapi.com/tos).

## Markets shortlist

| Option | Cost | Quotes/charts | Commentary and display considerations |
| --- | --- | --- | --- |
| Twelve Data Venture | Displayed USD 499/month configuration; lower starting-price text also appears. Obtain an exact quote. | Advertises external display, real-time US/EU data, delayed Australian data and time-series data; exact exchanges and entitlements determine coverage. | Corporate press releases are not independent commentary. Use existing EIA/eligible news or a separate licensed feed. Confirm exchange surcharges, attribution, timestamps and caching terms. |
| EODHD commercial | Internal-use plan USD 399/month; Enterprise USD 2,499/month; custom quotes available. | Commercial table includes live/delayed data, time series and US WebSocket coverage; global “live” is not a promise of real-time data for every exchange. | Offers news and sentiment. The USD 399 internal plan explicitly prohibits external display. Public website rights require an appropriate written agreement; do not buy the internal plan for this homepage. |
| Marketaux Basic, as a commentary companion | USD 29/month; 2,500 requests/day; up to 20 news articles/request. | Its news sentiment/statistics are not stock prices or point changes. A quote provider is still required. | Symbol-filtered financial news can accompany a quote panel. Confirm publisher display/image rights and the intended commercial use before activation. |

Sources: [Twelve Data business plans](https://twelvedata.com/pricing-business), [corporate press-release endpoint](https://twelvedata.com/news/march-2026-updates); [EODHD commercial plans and internal-use restriction](https://eodhd.com/commercial-pricing); [Marketaux pricing](https://www.marketaux.com/pricing), [API documentation](https://www.marketaux.com/documentation), [terms](https://www.marketaux.com/tos).

**Illustrative combined cost:** the displayed USD 499 Twelve Data configuration plus USD 29 Marketaux is **USD 528/month**, before taxes or exchange/display add-ons. Existing eligible commentary could avoid the separate USD 29 subscription. This estimate is not a final licence quote.

For request sizing, ten symbols refreshed once per minute during a 390-minute session over 22 trading days represent **85,800 symbol updates/month**, before chart-history requests. A shared server cache prevents visitor counts multiplying those upstream updates. Provider-specific batching/credit weights and streaming subscriptions change billing; verify them for the selected plan. [Twelve Data credit rules](https://twelvedata.com/pricing-business).

## What is actually wrong with current freshness and images?

The read-only [database audit](current-content-audit.json) found a completed shared job at **15 October, 6:29 AM Manila**. That job recorded **21 NewsData HTTP 422 failures** and **one GDELT HTTP 429**; EIA and EEA succeeded. NewsData's last successful poll was 12 October, 2:29 PM Manila; GDELT's was 13 October, 6:29 AM Manila. A completed aggregate job therefore does not mean that news providers refreshed. HTTP 422 needs the provider's specific validation/error code; HTTP 429 indicates throttling. The local diagnostic currently stops before a request because `NEWSDATA_API_KEY` is not configured locally. A valid local key or deployed error detail is required to finish that diagnosis.

The schedule is three pulls per day, so even a healthy faster provider would still wait up to roughly eight hours for the next scheduled ingestion. Changing provider alone does not change that schedule. After choosing the plan, choose a shared polling interval and recalculate request limits. The Exa example above assumes a future two-hour interval; that change has not been activated.

The [first browser measurement](initial-browser-verification.json) found a Guardian image with **140 source pixels displayed at about 1,200 pixels**. The signed provider URL itself requested `width=140`; this was not a Next.js compression setting. Code now rejects undersized slide images in favour of the local high-resolution fallback. Future anonymous access checks retain a publisher-supplied sharing-image URL from the already fetched HTML, and ingestion prefers that URL. Existing cached access checks need their ordinary refresh before new sharing-image metadata is available. Image URL signatures are preserved.

## Footnotes and Sources

There is no verified basis here to declare every current footnote legally mandatory, or to declare that every attribution can move elsewhere. Terms differ by provider and exchange. The implementation retains publisher/provider identification, publication times, feed delay/staleness and a Sources link, while shortening the surrounding prose. Global Intelligence retains a concise rights notice. Final provider-specific placement must follow the selected contract; any required on-panel attribution stays visible.

## Decisions needed

1. News: select The News API or Exa for a bounded trial, obtain the key and resolve public-display/image permissions. Target spending remains USD 10–20/month.
2. Markets: choose the company symbols, exchanges, refresh interval and monthly budget. Obtain a written external-display quote before connecting live quotes.
3. Related data: review the separate [domain/industry data matrix](RELATED-DATA-REVIEW.md); news search, market quotes and numerical sustainability datasets are separate sources and should not be substituted for one another.
