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

The trial uses control record `enerqa-news-sync / scheduled-news-apitube-v1`.
Production's `scheduled-news-v1` record is not claimed or updated. No schema
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
- This evaluation deliberately requests `theguardian.com`, `bbc.co.uk`, and
  `reuters.com`, all already present in Enerqa's publisher allowlist. No unreviewed
  publisher was added to fill a gap.
- Boolean title searches have a maximum 31-day window. Business and context
  searches use 31 days; other topic searches use seven days. Both window ends
  are pinned before a request waits for its rate-limit slot.
- APITube rejects wildcard queries. Sector stems are translated to supported
  `title.pattern` predicates; quoted phrases are preserved.
- Internal accounting caps APITube at 80 requests/day and eight/minute, with
  serialized requests spaced by at least 8.5 seconds.
- Scheduled pulls use four category searches, three market searches and up to
  five rotating industry searches. APITube does not repeat the twelve legacy
  domain phrase searches: the initial live comparison found them redundant,
  and the larger batch exceeded the existing five-minute route runtime.
- Request field selection and mapping exclude full article bodies, generated
  summaries, provider pagination URLs and credentials.
- Page notices identify the free feed's 12-hour delay. Publication times remain
  distinct from collection/refresh times.

## Operator commands

```sh
# Start the local site on the trial branch; the key stays in ignored server env files.
npm run dev

# Collect and save screened APITube news with the trial's separate job lease.
npx tsx scripts/pull-news.ts --manual

# Cover all thirteen industries without repeating the topic and market searches.
npx tsx scripts/pull-news.ts --manual --industries

# Audit saved page feeds and ensure that reading them makes no news API requests.
npx tsx scripts/verify-apitube-trial.ts docs/feedback/APITUBE-TRIAL-2026-10-24.json
```

The audit reports real card counts for every domain and industry. An empty result
stays empty; it does not activate another provider or fabricate a story.

## Current evaluation results

- [Saved-feed evidence](feedback/APITUBE-TRIAL-2026-10-24.json): eleven approved,
  anonymously readable APITube articles. One additional story is retained privately
  as rejected/unknown after a stock-context regression check.
- All four domain feeds have qualifying articles. Four of thirteen industry feeds
  have qualifying articles; nine industries and the market panel are empty.
  Every displayed news record comes from APITube. The approved sample is from
  The Guardian; broader publisher coverage has not been demonstrated.
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
- Existing provider articles and production's refresh control record match the
  pre-trial database fingerprints. Saved-page reads made no news API requests.
- 700 tests across 90 files passed. Production build, TypeScript and ESLint passed.
- [Browser evidence](feedback/APITUBE-BROWSER-2026-10-24.json): 42 checks at
  1366px and 390px across the homepage, all seventeen detail pages, Knowledge Hub,
  Global Intelligence and the business-domain news destination. All returned
  HTTP 200, with no JavaScript errors, horizontal overflow, exposed key or legacy
  news-provider labels. Browsing made zero news API calls.
- Screenshots: [desktop homepage](feedback/apitube-home-1366.png),
  [mobile homepage](feedback/apitube-home-390.png),
  [mobile manufacturing news](feedback/apitube-manufacturing-390.png).

## Follow-up before a public switch

- Review the saved-feed and browser evidence linked from this trial report.
- Compare relevance and coverage across the six client subjects. The rules are
  conservative filters and do not guarantee a perfect editorial judgment.
- Coverage TODO: verify the provider's availability for the nine empty sectors
  and genuine stock-market reporting. Test any additional already-approved
  publishers explicitly; do not silently relax the allowlist or add a fallback.
- Confirm the selected paid/PAYG plan's production eligibility and the permitted
  public headline, description and image display. API access does not transfer
  publisher copyright.
- Deployment and production cron activation are outside this local branch trial.

References: [search endpoint](https://docs.apitube.io/platform/news-api/everything),
[filter limits](https://docs.apitube.io/platform/news-api/query-builder),
[category catalogue](https://docs.apitube.io/platform/news-api/list-of-categories),
[response fields](https://docs.apitube.io/platform/news-api/response-structure),
[pricing](https://apitube.io/us/pricing),
[terms](https://apitube.io/terms/terms-of-service).
