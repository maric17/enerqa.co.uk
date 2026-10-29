# News freshness — 29 October 2026

## Implemented locally

- Relevant stories sort by publication time on homepage and domain reads. Exact-search provenance and cross-domain variety no longer put older stories first.
- APITube topic searches use broader keywords and existing approved specialist publishers. Returned category evidence, editorial checks and anonymous article-access checks still apply.
- Transport category evidence can support explicit battery and electric-fleet reporting. Consumer gadget battery stories remain excluded.
- General news is scheduled six times daily, 3–5 hours apart; stocks and industry batches retain their eight-hour schedules. The added starts are one hour after industry-3, so APITube jobs do not start together. Separate four-hour general-job claims prevent the duplicate-run guard from skipping the added runs.
- Scheduled requests total 72 per day against the application limit of 80. Manual searches, retries and maintenance also use that allowance.
- Visible news pages re-read saved news every five minutes and when the tab becomes visible. This does not call APITube from the browser.
- “Feed checked” distinguishes retrieval from publication. Stories over 48 hours old carry an explicit age notice.
- Homepage category selection uses a sufficiently large saved pool. Many stories from one publisher in one category cannot hide that publisher's newest story in another category.
- Completed scheduled refreshes immediately expire the news and search caches so the next visitor reads the saved update.

## Verified

- Full test suite after review fixes: 763 tests across 92 files passed.
- TypeScript, ESLint on changed code and whitespace checks passed.
- Local homepage returned HTTP 200 and rendered the changed attribution.
- Regression tests first reproduced overlapping job starts and category stories lost to the global publisher cap; both pass after the fixes.
- Real database guard verification passed all eight checks using temporary rows rolled back at completion. No shared news records were written by that verification.
- Browser checks passed at 1440×900 and 390×844: all four category leads rendered, no horizontal overflow and no uncaught browser errors. Both tab-return refresh and the five-minute timer requested updated saved data.
- APITube request count remained 405 before and after browser verification: zero provider calls were made by page visits or automatic page refreshes.
- Browser-verified lead publication dates: climate 28 October, energy 27 October, environment 28 October, business 26 October. Business correctly displays the notice that it is older than 48 hours.
- Manual general-news refresh completed at approximately 14:15 Manila time, with 37 eligible saved stories and no provider failures. These include retained stories, not 37 newly published articles.
- New searches returned 3 climate, 3 energy and 9 environment candidates. Business returned no candidates. Unrelated candidates were excluded.
- The public homepage was confirmed to include the newly saved 28 October Mongabay environment story. These checks covered local code; production deployment must be verified separately.

## Open deployment and coverage actions

- [ ] Deploy the code and `vercel.json` changes to Vercel Production.
  - Next: verify the new “Feed checked” label, newest-first category leads and six daily general-news entries after deployment.
- [ ] Verify the next additional general-news run in production.
  - Next: inspect its job record, provider outcomes and visible article publication dates. An HTTP success alone does not prove new content arrived.
- [ ] Improve business coverage if repeated searches remain empty.
  - Next: measure APITube coverage for additional approved publishers before changing the reviewed source groups. Do not bypass editorial or access checks to fill the panel.

APITube delivery times and publisher coverage still govern availability. The application cannot guarantee newly published news at every refresh.
