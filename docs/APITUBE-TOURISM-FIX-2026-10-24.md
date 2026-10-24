# Tourism news correction — 24 October 2026

Later update: the [all-industry correction](APITUBE-ALL-INDUSTRIES-FIX-2026-10-24.md)
has populated and browser-verified all thirteen local industry feeds. This report
preserves the earlier tourism-only repair and its evidence.

The local tourism page was empty because the coverage audit did not publish
diagnostic candidates. Its approved-publisher discovery query also omitted a
useful ecological context, and the topic rules did not recognize that context in
the provider's short description.

## Changes and result

- Added `turtle` to tourism discovery while retaining its existing climate,
  energy, sustainability and environment terms. The query stays within the
  shared 100-character limit; longer queries fall back in interactive search.
- Added turtle-nesting and coral-reef vocabulary to environmental screening.
  Provider category evidence is still required. An unrelated hotel licensing
  story remains rejected; no publisher was added to fill the page.
- Ran the normal targeted industry ingestion with the shared refresh lease,
  editorial rules, anonymous publisher-access check and database write.
- Two APITube requests tested the initial and final shortened queries. Each
  returned one candidate. There is one new approved story, not fifteen new
  stories: the operator's `storedItems: 15` also includes rechecked saved items.

The hero and its news-only Global Intelligence destination now both show the
same Guardian report about resort development and coastal biodiversity. Its
publication date remains **10 October 2026**. Today's refresh time does not make
it newly published.

The saved inventory now contains fifteen approved APITube records and one
withheld record. Six of thirteen industries have news. Finance, infrastructure,
transport, agriculture, mining, technology and healthcare/education estates
remain empty; this scoped correction does not claim to complete those feeds.

## Verification

- All **706 tests across 90 files** passed. New cases exercise category-backed
  ecological screening, rejection of an unrelated hotel story, normal ingestion,
  saved industry selection and the shared industry news index without another
  provider or AI request.
- TypeScript, targeted ESLint and diff checks passed.
- Browser checks at 1366px and 390px confirmed one hero story and the same one
  news-only destination result, HTTP 200, no JavaScript errors, no horizontal
  overflow and no API key in page content. Browsing made zero news/AI calls.
- The repair increased the APITube ledger from 125 to 127. Other-provider counts,
  legacy news records and production's refresh-control record were unchanged.
  APITube's normal pipeline updated its own news and trial refresh state.
- A verified-account operator flag temporarily provides one request slot only
  for a targeted APITube-only industry pull, after checking live points and five
  points of headroom. It preserves request history, pacing and the refresh lease,
  and restores the process's normal limit on exit. Cron and default limits did
  not change. The user's server on port 3000 was left running.

Evidence: [saved feeds](feedback/APITUBE-TOURISM-SAVED-2026-10-24.json),
[refresh outcomes](feedback/APITUBE-TOURISM-REFRESH-2026-10-24.json),
[browser checks](feedback/APITUBE-TOURISM-FIX-2026-10-24.json),
[provider isolation](feedback/APITUBE-TOURISM-ISOLATION-2026-10-24.json),
[desktop screenshot](feedback/apitube-tourism-fixed-1366.jpg),
[mobile screenshot](feedback/apitube-tourism-fixed-390.jpg).

## Remaining work

- [ ] Fill the seven remaining empty industries through reviewed retrieval and ingestion.
  - Next action: apply the source/query findings in the site coverage assessment.
- [ ] Prove sustained tourism freshness and source diversity.
  - Next action: evaluate incoming approved-publisher results over seven days.
- [ ] Implement a complete scheduled refresh after the coverage/runtime checks pass.
  - Next action: benchmark final ingestion including access checks and database writes.
