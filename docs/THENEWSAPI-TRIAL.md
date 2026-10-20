# TheNewsAPI client trial

Verified locally on 19 October 2026, Asia/Manila. No production deployment or subscription purchase was performed.

## Current behavior

- Domain pages show one news card each for this preview.
- General news uses TheNewsAPI alone: homepage, market commentary, domain and industry news, saved searches and live Global Intelligence news searches.
- Legacy NewsData/GDELT connectors and saved records remain available in code/storage, but do not supply fallback news during this trial.
- Dedicated official-update and research modules retain their existing sources. They are separate content types, not news fallback.
- The homepage opens the first domain with a real article. Empty domains remain selectable and report their empty state.
- Cards distinguish the original publisher from the aggregator with “Via TheNewsAPI”. An EIA article retrieved by TheNewsAPI is not an EIA RSS fallback.

## Latest four-domain preview

The follow-up Free-plan test succeeded for all four Enerqa domains. Four focused topic requests returned ten article entries; the refresh retained eight verified articles, including previously saved records. There was no legacy-provider fallback and no subscription purchase.

The approved publisher list was expanded only after checking readable article destinations: The Conversation, BBC (`bbc.co.uk`) and Mail & Guardian (`mg.co.za`). Search now targets titles/descriptions and uses focused queries for each domain. Domain selection prefers articles found by that domain's own query; it preserves date order within direct matches. The Business vocabulary now includes climate finance and adaptation finance.

| Enerqa domain | Article selected | Original publisher |
| --- | --- | --- |
| Climate | [African countries could save billions by cutting air pollution and greenhouse gases at the same time](https://theconversation.com/african-countries-could-save-billions-by-cutting-air-pollution-and-greenhouse-gases-at-the-same-time-291944) | The Conversation |
| Energy | [Changes made to plans for solar farm near Selby after opposition](https://www.bbc.co.uk/news/articles/c8qln0ydgpr3o) | BBC |
| Environment | [River Taff fuel pollution spreads 2.5 miles from Taffs Well](https://www.bbc.co.uk/news/articles/c8vgxnp5w6vzo) | BBC |
| Business and Finance | [Africa faces ‘failed adaptation’ as climate finance falls billions short](https://mg.co.za/the-green-guardian/2026-10-13-africa-faces-failed-adaptation-as-climate-finance-falls-billions-short/) | Mail & Guardian |

Each selected record identifies `thenewsapi` as its provider and has a `verified_open` access verdict. The homepage uses one story per domain tab. Each domain page's Latest News section is set to one card for the preview. Publication dates remain visible; the Business article is from 13 October, rather than being presented as today's news.

This demonstrates that Free can supply one suitable story per domain with the current queries and reviewed publishers. It does not guarantee daily coverage or demonstrate Basic's actual response size; the account has not been upgraded.

## Initial narrow-publisher test

The existing server-only `THE_NEWS_API_TOKEN` authenticated successfully with HTTP 200. Responses reported `meta.limit: 3`, consistent with the Free plan; the account's billing state was not inspected.

One manual refresh made 21 TheNewsAPI requests: four topic queries, twelve domain queries and five queries from the rotating industry group. The run received 15 article occurrences, retained four relevant occurrences, and saved two distinct articles after the publisher/date/deduplication gates. Both destination checks returned `verified_open`.

| Publisher | Article saved through TheNewsAPI | Supplied description |
| --- | --- | --- |
| U.S. EIA | [U.S. small-scale solar generation has quadrupled in the last decade](https://www.eia.gov/todayinenergy/detail.php?id=68324) | No |
| NASA | [Power Up: Roll Out Solar Arrays Boost Space Station Power Supply](https://www.nasa.gov/missions/station/iss-research/power-up-roll-out-solar-arrays-boost-space-station-power-supply/) | Yes |

Both records have images. Missing descriptions remain empty; article body snippets are not substituted.

In the initial test, the homepage browser check displayed the solar headline with “Via TheNewsAPI”. Its diagnostics reported only `thenewsapi`. The Global Intelligence page with `type=news&source=thenewsapi` displayed both saved headlines. At that initial refresh, the homepage had an Energy story and no eligible Climate, Environment or Business stories; market commentary was also empty. No older provider supplied those gaps.

## Wider provider sample

A separate diagnostic used the same seven-day English-language topic search without the site's publisher filter. It reported 11,577 matches and returned three articles, all with descriptions and images:

- [There’s a hidden bias affecting what we know – and don’t know – about nature](https://theconversation.com/theres-a-hidden-bias-affecting-what-we-know-and-dont-know-about-nature-293815) — The Conversation.
- [Steel Dynamics (STLD) Set to Report Q3 Earnings After Market Close on October 19](https://www.gurufocus.com/news/9129080/steel-dynamics-stld-set-to-report-q3-earnings-after-market-close-on-october-19) — GuruFocus.
- [Trump Defends Russia Sanctions Waivers, Zelenskyy Warns Of Consequences](https://www.rferl.org/a/ukraine-russia-trump-putin-zelenskyy-war/33878954.html) — Radio Free Europe/Radio Liberty.

These are raw discovery examples, not approved site cards. They were not inserted into the public feed, and their destinations were not verified by this diagnostic. Broad keyword searches can include general company or political stories that do not fit Enerqa's subjects.

The initial approved-publisher filter substantially narrowed coverage; the follow-up review above resolved the empty domain previews. Upgrading the plan increases the response size; it does not guarantee more recent coverage from those publishers.

## Configuration and limits

- Server credential: `THE_NEWS_API_TOKEN`, already present in local `.env`. Never prefix it with `NEXT_PUBLIC_`.
- Provider selection: `src/lib/api/news/policy.ts`.
- Connector: `src/lib/api/news/thenewsapi.ts`.
- [Documented endpoint](https://www.thenewsapi.com/documentation): `/v1/news/all`. Queries translate internal `OR`/`AND` to `|`/`+` and search titles/descriptions using the reviewed publisher list, English and a seven-day discovery window.
- The API chooses the account's maximum response size because requests omit `limit`.
- [Published plans](https://www.thenewsapi.com/pricing): Free has 100 requests/day and three articles/request; Basic has 2,500 requests/day and 25 articles/request, at USD 19/month with monthly billing or USD 16/month with annual billing.
- Internal trial limit: 80 requests/day shared across server instances. The existing three daily jobs make about 61 topic/domain/rotating-industry requests per day; live searches/manual pulls use the remaining allowance.
- Public page visits read saved articles; they do not spend provider requests. Live searches remain bounded by the shared request budget.
- Existing publisher approval, relevance, timestamps and anonymous-access checks remain in place. No full article body is requested or published.

## Verification

Follow-up four-domain preview: 29 affected test files / 258 tests passed, along with TypeScript and ESLint. A real browser verified all four homepage tabs and all four domain pages; every Latest News section contained exactly one card attributed to TheNewsAPI.

- `npm run db:check`: authenticated read-only database query and existing connector tables passed.
- 31 affected test files / 276 tests passed, including trial isolation, legacy saved-record exclusion, provider failure, connector mapping, token redaction, live-search filtering and homepage behavior.
- TypeScript and ESLint checks passed for the implementation before the final browser review.
- Real browser: homepage headline/attribution and both Global Intelligence news cards verified at `http://localhost:3000`.

## Next actions

- [x] Authenticate the existing token and perform a real provider-only refresh.
- [x] Verify saved news and rendered articles use TheNewsAPI alone.
- [x] Populate one suitable article for each of the four Enerqa domains using the Free account.
- [ ] Review article suitability and coverage with the client before subscribing.
  - Review the four-domain preview above against the initial limited-coverage test. Review any additional publishers individually before changing the approved list.
- [ ] Confirm the client's chosen plan and publisher/image reuse requirements before production launch.
  - API access and publisher content rights are separate; the trial does not establish blanket republication rights.
- [ ] Deploy the reviewed changes and confirm `THE_NEWS_API_TOKEN` exists in the deployment's server environment.
  - Run one authenticated deployment refresh and verify the rendered news cards and scheduled jobs there.
- [ ] Enable legacy fallback only after the provider-only review is complete and the behavior is agreed.

To repeat a manual refresh, use the existing operator script sparingly; each run uses the shared database and API request allowance:

```sh
# Run four topic requests for the domain preview while respecting the shared job lease.
npx tsx scripts/pull-news.ts --manual --topics
```
