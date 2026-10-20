# Agriculture news coverage repair — 20 October 2026

## Cause confirmed

The empty hero described the saved active-provider pool, not the availability of agriculture news in the world. TheNewsAPI had 20 verified saved stories and none about agriculture. A relevant older food/environment record existed under NewsData, which the current provider-only trial excludes.

The original agriculture discovery query omitted farming/farmer vocabulary. A targeted refresh returned one ultraprocessed-food article whose description said “food environment”; it correctly failed the sustainability relevance check.

A revised query returned three recent articles, including two relevant agriculture stories. Both valid stories failed the original headline-only topic check because their sustainability context appeared in the publisher-supplied description.

## Repair

- Agriculture discovery now includes agriculture/aquaculture word stems, farming, farmers, food and sustainability word variants. The normal seven-day publication window remains in place. A 30-day diagnostic was tried, but was not needed for the final repair.
- `isOnSiteTopic` accepts an agriculture/food headline when its supplied description explicitly discusses sustainability, climate, emissions, biodiversity, food systems/security or specific environmental impacts/resilience.
- Generic “food environment” wording alone remains insufficient. General food-health, football, restaurant and solar-farm stories are not used to fill agriculture coverage.
- No provider fallback, publisher-list expansion, new subscription, invented article or bypass of destination checks was introduced.

## Saved result

One targeted refresh using `scripts/pull-news.ts --manual --industry agriculture-food-aquaculture` returned three provider items, retained two relevant articles, and verified/saved 22 records including the existing 20. Two articles were newly added:

| Article | Publisher | Published UTC |
| --- | --- | --- |
| [Is this the end for small-scale pig farming?](https://www.bbc.co.uk/news/articles/cqze4y38zk6lo) | BBC | 20 October 2026, 05:03 |
| [Africa must own the future of food](https://mg.co.za/thought-leader/2026-10-19-africa-must-own-the-future-of-food/) | Mail & Guardian | 19 October 2026, 08:25 |

Both destination checks returned `verified_open`. The ultraprocessed-food article was not saved. Ordinary page visits still read saved records without contacting the news provider.

## Verification

- 144 tests passed across relevance, provider-only ingestion, saved reads, discovery budgets, provider request construction, the industry hero and homepage news integration/helpers.
- Regression tests cover real food/farming headlines, unrelated food-health/football/restaurant cases, and discovery → destination check → storage → sector read.
- Targeted ESLint, TypeScript and `git diff --check` passed.
- Browser checks at 1366×768 and 390×844 confirmed both saved headlines, original article links, publisher/date attribution and two navigation segments. The industry title stayed visible when advancing stories; news and controls fit above the fold, with no overflow or browser errors. Screenshots: `/tmp/enerqa-agriculture-fixed-1366.png` and `/tmp/enerqa-agriculture-fixed-390.png`.

## Next steps

- Review the local agriculture hero and both article links.
- Include the query/relevance changes in the next deployment, then verify the next scheduled agriculture discovery and the public route.
