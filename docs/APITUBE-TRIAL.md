# APITube news evaluation — 24 October 2026

Branch: `trial/apitube-news-2026-10-24`, based on `main` at `51cd94b`.

This branch evaluates APITube as the only general-news provider. Homepage heroes,
market commentary, domain news, industry heroes, Knowledge Hub previews, saved
news search, and explicit live news discovery use the same provider policy.
Scholarly research, official updates, disclosures and numerical datasets retain
their own sources.

## Collection and publication

1. Read `API_TUBE_API_KEY` on the server and authenticate through `X-API-Key`.
2. Request article categories, focused Boolean title queries, approved publishers,
   language, publication dates and at most ten results per request.
3. Require category evidence and contextual topic rules. Reject mixed newspaper
   digests, daily weather forecasts and unsupported category-only matches.
4. Apply the existing publisher allowlist, publication-date checks and URL deduplication.
5. Check that each destination is anonymously readable (`verified_open`).
6. Save approved originals and access evidence in the database. A failed database
   write withholds the article.
7. Ordinary pages read saved records. No provider request is made for a page visit.
   Explicit Global Intelligence discovery also completes screening, access checks
   and database storage before returning news.

APITube screening needs no OpenAI key or model call. Saved decisions are explicitly
labelled `apitube-categories-and-rules-v1`; they are not represented as human or
AI editorial reviews. Saved category evidence and exact headline/description must
still agree when the record is read.

## Database isolation

Articles use provider `apitube` in `enerqa_connectors.external_records`. Previous
provider articles are retained and excluded from trial news displays.

The five scheduled units use separate control records under
`enerqa-news-sync / scheduled-news-apitube-v1/<job>`. The older combined manual
maintenance path retains `scheduled-news-apitube-v1`. Production's
`scheduled-news-v1` record is not claimed or updated. No schema
migration or article deletion is needed. Anonymous-access evidence and request
accounting use the existing shared operational tables.

## Verified API behavior and limits

- The supplied key returned HTTP 200, with a 100-point allowance and a 10-request
  minute limit. Treat the current evaluation as the delayed Free plan.
- The first category-only climate request returned unrelated film/game interviews.
  Article categories alone do not meet the client's relevance requirement.
- Combining title queries and approved publishers returned relevant climate stories.
- Categories in live responses have numeric internal IDs. Their `links.self`
  fields contain the stable IPTC identifiers used by the request filters.
- `source.domain`, `category.id` and `language.code` accept at most three values.
  The provider documents silently dropping additional values.
- The default topic/market group requests `theguardian.com`, `bbc.co.uk`, and
  `reuters.com`. Seven industry queries now use reviewed sector-specific groups,
  each limited to three approved domains; see the
  [all-industry correction](APITUBE-ALL-INDUSTRIES-FIX-2026-10-24.md).
- Boolean title searches have a maximum 31-day window. Business and context
  searches use 31 days; other topic searches use seven days. Both window ends
  are pinned before a request waits for its rate-limit slot.
- APITube rejects wildcard queries. Sector stems are translated to supported
  `title.pattern` predicates; quoted phrases are preserved.
- Internal accounting caps APITube at 80 requests/day and eight/minute, with
  serialized requests spaced by at least 8.5 seconds.
- Scheduled pulls are now split into general news (four category searches),
  stocks (three market searches), and three industry batches (5/5/3 searches).
  Every cycle covers all thirteen industries, for 60 requests daily before retries.
  See the [split-job implementation and activation status](APITUBE-SPLIT-NEWS-JOBS-2026-10-24.md).
  APITube does not repeat the twelve legacy
  domain phrase searches: the initial live comparison found them redundant,
  and the larger batch exceeded the existing five-minute route runtime.
- Request field selection and mapping exclude full article bodies, generated
  summaries, provider pagination URLs and credentials.
- Page notices identify the free feed's 12-hour delay. Publication times remain
  distinct from collection/refresh times.

## Operator commands

For the completed forty-six-request fetching assessment, section-by-section
coverage findings and structured-industry comparisons, see
[site coverage check](APITUBE-SITE-COVERAGE-CHECK.md). The updated local key was
accepted; diagnostic candidates remain unpublished.

```sh
# Start the local site on the trial branch; the key stays in ignored server env files.
npm run dev

# Collect and save screened APITube news with the trial's separate job lease.
npx tsx scripts/pull-news.ts --manual

# Cover all thirteen industries without repeating the topic and market searches.
npx tsx scripts/pull-news.ts --manual --industries

# Run only stocks, using its independent scheduled-job state and normal budget.
npx tsx scripts/pull-news.ts --manual --job stocks

# Audit saved page feeds and ensure that reading them makes no news API requests.
npx tsx scripts/verify-apitube-trial.ts docs/feedback/APITUBE-TRIAL-2026-10-24.json
```

The audit reports real card counts for every domain and industry. An empty result
stays empty; it does not activate another provider or fabricate a story.

## Current evaluation results

- [Latest saved-feed evidence](feedback/APITUBE-ALL-INDUSTRIES-SAVED-2026-10-24.json): twenty-nine approved,
  anonymously readable APITube articles. One additional story is retained privately
  as rejected/unknown after a stock-context regression check.
- All four domain feeds and all thirteen industry feeds have qualifying articles
  after the targeted industry corrections. Some industries have only one story.
  Three approved stock
  stories are now saved for the two-card market panel.
  Every displayed news record comes from APITube. Six additional publishers
  were reviewed before targeted ingestion. Approved stories include sector
  reporting from these sources as well as The Guardian.
- A broader market probe returned stories from publishers outside the existing
  allowlist. Those results were not added to the published pool. A legal story
  mentioning Wall Street was explicitly withheld; stock reporting now requires
  stock/index subjects and actual market movement.
- Domain pages and their View All News destinations retain the saved classification,
  including corporate environmental obligations that do not literally spell out ESG.
- [Live refresh evidence](feedback/APITUBE-REFRESH-2026-10-24.json): the reduced
  twelve-request batch completed in 179.33 seconds, below the route's 300-second
  limit. This records the collection run before the final market-context rejection;
  use the saved-feed audit for the current publication count.
- Legacy news and production's refresh-control fingerprints stayed unchanged
  during the diagnostic batches, tourism repair and remaining-industry repair. They differ from the older
  morning baseline due to changes already present before those checks; see the
  [coverage assessment](APITUBE-SITE-COVERAGE-CHECK.md). Saved-page reads made no news API requests.
- Latest release-preparation validation: 751 tests across 92 files, TypeScript
  and ESLint for all 51 changed code files passed. The production Webpack build
  passed in an isolated temporary copy with schema changes disabled; compilation
  reported warnings. See [release validation evidence](feedback/APITUBE-RELEASE-VALIDATION-2026-10-24.json).
- [Latest industry browser evidence](feedback/APITUBE-ALL-INDUSTRIES-BROWSER-2026-10-24.json):
  all thirteen heroes and news-results destinations passed at desktop/mobile
  sizes (52 checks), with correct saved news links and zero news API requests.
- [Browser evidence](feedback/APITUBE-BROWSER-2026-10-24.json): 42 checks at
  1366px and 390px across the homepage, all seventeen detail pages, Knowledge Hub,
  Global Intelligence and the business-domain news destination. All returned
  HTTP 200, with no JavaScript errors, horizontal overflow, exposed key or legacy
  news-provider labels. Browsing made zero news API calls.
- Screenshots: [desktop homepage](feedback/apitube-home-1366.png),
  [mobile homepage](feedback/apitube-home-390.png),
  [mobile manufacturing news](feedback/apitube-manufacturing-390.png).

## Market commentary follow-up

The original exchange-name searches missed reports whose headlines described
"global stocks", "AI stocks" or "chip stocks" without naming Nasdaq or FTSE.
The first market query now also requests `stocks`, `equities` and `"share prices"`.
London and regional searches remain separate; the request count stays at three.
Publisher, category, contextual screening and anonymous-access rules are unchanged.

A market-only refresh returned four candidates, rejected the unrelated Wall Street
legal story and saved three relevant, verified-open market reports. Fourteen
APITube articles are now approved in total; legacy records and production's refresh
state still match the pre-trial fingerprints. London and regional queries returned
no candidates, so specific coverage for those exchanges is not established.

An exploratory CNBC source filter returned HTTP 400 `ER0214` (source domain not
found). It was not added to the connector. The successful refresh continues to
request the original three approved publishers and uses APITube alone.

The follow-up's 38 focused tests, TypeScript and ESLint checks passed. The initial
full build and 700-test result above refer to the earlier trial validation.
[Desktop and mobile browser checks](feedback/APITUBE-STOCK-2026-10-24.json)
confirmed two visible commentary cards, APITube attribution, no horizontal overflow,
no JavaScript errors and zero news API requests from page visits. The panel avoids
duplicating the newer AI/oil story already selected for a domain hero, so its
second card is the older chip-stock report with its original date displayed.
The browser check reads the streamed section without waiting for unrelated
homepage resources to finish loading.
Screenshots: [desktop markets](feedback/apitube-stock-1366.png),
[mobile markets](feedback/apitube-stock-390.png).

## Government industry-page correction

The earlier exact-phrase selection returned no government news even though three
approved, access-verified policy articles were already saved. The page now also
requires a relevant headline subject together with a public institution and a
policy action in the headline/description. This finds the net-zero target,
air-pollution inquiry and EU deforestation-law stories while excluding a company
pledge or a minister's unrelated appearance.

The same contextual rule tags Global Intelligence results. Industry news links
now include `type=news`, so research does not inflate their news counts. The fix
reads existing approved records and spends no provider or AI requests. This is a
government-page selection correction. The later
[all-industry correction](APITUBE-ALL-INDUSTRIES-FIX-2026-10-24.md) adds versioned
fetch-time assignments shared with all thirteen industry displays.

The full suite passed with 704 tests across 90 files; TypeScript and targeted
ESLint checks passed. See [saved-feed results](feedback/APITUBE-GOVERNMENT-FEEDS-2026-10-24.json).
[Desktop and mobile browser checks](feedback/APITUBE-GOVERNMENT-FIX-2026-10-24.json)
confirmed three carousel stories and the same three news-only destination results,
with no JavaScript errors, horizontal overflow, news/AI requests or news-record
changes. Screenshots: [desktop](feedback/apitube-government-fixed-1366.jpg),
[mobile](feedback/apitube-government-fixed-390.jpg).

## Follow-up before a public switch

The [all-industry correction](APITUBE-ALL-INDUSTRIES-FIX-2026-10-24.md) completed
the seven remaining empty feeds after the tourism repair. All thirteen industry
heroes and news-only destinations now have checked, saved articles. This proves
current local coverage, not reliable daily freshness or a production deployment.

- Read the [complete thirteen-industry review](APITUBE-INDUSTRY-REVIEW-2026-10-24.md).
  Its historical 39 browser checks and 18 diagnostic requests distinguish empty saved feeds,
  missed candidates, weak sector assignments and provider limitations. The current
  sample predates the current corrections. Repeated refreshes are still needed
  before deciding whether APITube meets production coverage needs.
- Review the saved-feed and browser evidence linked from this trial report.
- Compare relevance and coverage across the six client subjects. The rules are
  conservative filters and do not guarantee a perfect editorial judgment.
- Coverage TODO: verify repeated fresh sector coverage and investigate
  London/regional stock reporting. The split cron code is implemented; configure
  `CRON_SECRET`, time a complete real cycle and verify the deployed jobs before
  relying on production refreshes. A merged PR alone does not verify deployment
  or successful cron execution.
- Confirm the selected paid/PAYG plan's production eligibility and the permitted
  public headline, description and image display. API access does not transfer
  publisher copyright.
- Verify deployment and actual production cron outcomes separately from local tests
  and the repository merge.

References: [search endpoint](https://docs.apitube.io/platform/news-api/everything),
[filter limits](https://docs.apitube.io/platform/news-api/query-builder),
[category catalogue](https://docs.apitube.io/platform/news-api/list-of-categories),
[response fields](https://docs.apitube.io/platform/news-api/response-structure),
[pricing](https://apitube.io/us/pricing),
[terms](https://apitube.io/terms/terms-of-service).
