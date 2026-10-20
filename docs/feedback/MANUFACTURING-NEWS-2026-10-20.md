# Manufacturing news coverage repair — 20 October 2026

## Confirmed cause

The active TheNewsAPI pool had no saved manufacturing article. The original sector discovery query returned zero records. Older NewsData/GDELT records contained relevant industrial coverage, but the current trial uses TheNewsAPI alone.

Two vocabulary gaps affected this page:

- Discovery omitted factories, electricity wording and toxic industrial contamination. The page matcher also recognised `steel` but missed `steelmakers` and recognised `manufacturing` but missed other manufacturing word forms.
- A broader diagnostic found a current BBC factory-contamination article. Its headline said “toxic chemical,” which the shared sustainability topic check did not recognise.

## Repair

- Updated the manufacturing discovery query to cover manufacturing word forms, steel, factories, energy/electricity, emissions, toxic contamination and environmental wording. It remains within the existing 100-character query boundary and seven-day discovery window.
- Page matching recognises manufacturing word forms and explicit steelmaker/steelmaking/steelworks/steelworker terms. The broader `steel*` discovery prefix is not used for page matching, so the surname Steele does not classify a political story as manufacturing.
- Added the specific phrases “toxic chemical” and “chemical contamination” to shared environmental relevance/category matching. Generic “toxic workplace” language remains insufficient.
- Publisher approvals, original-article access verification and the provider-only policy remain in place. Wider diagnostic results from unreviewed publishers were not saved or displayed.

## Saved article

[Residents want more tests over Thornton-Cleveleys toxic chemical fears](https://www.bbc.co.uk/news/articles/crn4ewww9ypgo) — BBC, published 20 October 2026, 09:51 UTC. The supplied description identifies a former factory.

A targeted manual refresh returned one article, retained it, and verified/saved 23 records: one new article plus the existing 22. Its destination passed `verified_open`. This is local query/filter implementation and shared saved-data verification, not a production deployment.

## Verification

- 149 tests passed across relevance, saved reads, provider-only ingestion, discovery limits, provider request construction, industry hero integration and homepage news helpers.
- Regression tests cover industrial contamination through discovery → access check → storage → sector read, steelmaker headlines and rejection of the surname Steele as a manufacturing match.
- TypeScript, targeted ESLint and `git diff --check` passed.
- Browser checks at 1366×768, 390×844 and 320×640 confirmed the BBC headline, original link, publication/source/update attribution and fixed industry title. The story and controls fit above the fold with no horizontal overflow or browser errors. With one saved story, rotation controls correctly remain disabled. Screenshots: `/tmp/enerqa-manufacturing-fixed-{1366,390,320}.png`.

## Remaining steps

- Review the local manufacturing hero and its original-article link.
- Deploy the query/filter changes and verify the next scheduled manufacturing discovery.
- Review remaining sparse sector feeds together: Infrastructure, Transport, Tourism, Mining and Healthcare/Education. A successful aggregate refresh does not prove each sector has matching coverage.
