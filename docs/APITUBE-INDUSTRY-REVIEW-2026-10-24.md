# APITube industry-news review — 24 October 2026

This report preserves the audit before the government-page fix. Later corrections
on the same date populated all thirteen local industry feeds and verified their
heroes and news-only destinations at desktop/mobile sizes. See the
[all-industry correction](APITUBE-ALL-INDUSTRIES-FIX-2026-10-24.md) and the
[trial report](APITUBE-TRIAL.md). Findings and original screenshots below remain
the earlier pre-fix observations, not the current saved counts.

## Decision

Keep APITube as a trial. The current integration is not ready to become Enerqa's
sole production news feed. This is a judgment about the tested configuration and
sample, not proof that another vendor is better or that APITube has no suitable news.

Nine of thirteen industry news panels are empty. The four populated panels contain
five story placements representing only four distinct articles. Every displayed
industry-news link is to The Guardian. Only the oil-and-gas panel has two stories;
no industry reaches the current three-story display capacity.

There are useful missing stories in APITube. Broader searches exposed retrieval,
screening and page-assignment problems in our implementation. These need fixing
before a fair provider comparison or subscription decision.

## What was checked

- Browsed all thirteen industry pages at 1366px and 390px: 26 page checks.
- Opened all thirteen actual **View All Industry News** destinations: 13 more checks.
- Inspected every available carousel story, publication time, attribution and destination.
- Saved 18 screenshots; inspected the populated panels and an empty panel visually.
- Read the four distinct currently displayed publisher articles to assess their scope.
- Audited the approved database feed and the exact phrases responsible for each placement.
- Made thirteen broader, 31-day diagnostic searches, one per industry, retaining
  the connector's existing approved publishers, category filters and ten-result limit.
- Made five additional requests: three structured-industry searches, a BBC source
  availability check and a Reuters source availability check.

All 39 browser destinations returned HTTP 200. No JavaScript errors or horizontal
overflow were observed. Browsing made zero news API requests. Diagnostic requests
used the existing request accounting: APITube's daily count increased from 61 to 79
of the configured 80-request cap. All watched news records and refresh-control
records matched their pre-probe database fingerprints afterwards. No diagnostic
candidate was published, no other news provider was activated, and the user's
existing server on port 3000 was left running.

## Each industry's result

The two numbers under **Probe** mean returned candidates / candidates passing the
current general-topic rules. They are **not** counts of manually approved sector
stories. A general environmental story can still be a poor match for a particular
industry. All proposed new stories still need sector review and anonymous-access checks.

| Industry | Visible news | Probe | Assessment and concrete follow-up |
| --- | ---: | ---: | --- |
| Government, Regulators & Public Institutions | 0 | 5 / 2 | Placement failure is demonstrated: the broader search found two already-saved policy stories, but neither matches this page's exact phrases. Assign approved climate-target and environmental-legislation stories to the government sector. |
| Financial Institutions, Investors & Development Finance | 0 | 10 / 0 | Broad banking searches found general finance and incidental matches. The structured finance search returned one climate-activist story with no clear financial focus in its short metadata. Sustainable/development-finance coverage remains unproven. |
| Energy & Utilities | 1 | 10 / 3 | Relevant but thin. Additional grid-investment and heat-pump candidates were found; both are about 25 days old. Improve sector discovery and measure whether fresh utility stories arrive regularly. |
| Oil, Gas & Petrochemicals | 2 | 10 / 8 | There is usable coverage, but several candidates repeat the same Jackdaw event. Rank direct industry reporting above general stock commentary and group near-duplicate event coverage. |
| Industry, Manufacturing & Materials | 1 | 2 / 1 | The existing manufacturing match is clear. The only other broad candidate did not establish a sustainability connection. Coverage beyond one steel story remains thin. |
| Infrastructure, Real Estate & Industrial Zones | 0 | 8 / 2 | Promising circular-construction and heat-pump candidates were missed by discovery queries requiring different title wording. Add building materials, recycling, embodied carbon and retrofit discovery paths. |
| Transport, Logistics & Mobility | 0 | 7 / 0 | EV-adoption candidates exist but the current topic rules do not recognize electric vehicles. A passenger-sickness story and a product gimmick also appeared, so accepting every EV mention would be poor screening. Review transition context before assignment. |
| Water, Waste & Circular Economy | 1 | 10 / 3 | Supporting opinion; no focused lead. A separate structured search found water-supply, drought/canal and sewer candidates that the current topical rules reject. Add these contexts while excluding generic marine and animal incidents. |
| Agriculture, Food & Aquaculture | 0 | 10 / 4 | Food-production/biodiversity and food-waste candidates were found, but they are roughly 16–18 days old. Humanitarian food stories and conservation features also appeared. Require a substantive agricultural or food-system connection. |
| Mining & Natural Resources | 0 | 1 / 0 | A mining-related ground-risk candidate was found and rejected by the topic rules. Review environmental-impact context rather than requiring an explicit climate or energy phrase. Availability remains very thin. |
| Tourism, Hospitality & Destinations | 0 | 2 / 0 | A tourism-development/turtle-nesting conflict is a promising sector-and-biodiversity candidate. A hotel reference in a museum-licensing story is incidental. Improve discovery and confirm sustained destination coverage. |
| Technology, Telecoms & Data Infrastructure | 0 | 2 / 1 | A datacenter-pollution candidate was found, but it is about 23 days old. The original query requires energy/water/emissions wording and misses pollution reporting. Add spelling/plural variants and environmental-permitting context. |
| Healthcare, Education & Institutional Estates | 0 | 6 / 2 | Four broad candidates concern fiction/reviews. The two rule-passing university stories concern research influence or appointments, not estate operations. No strong hospitals/campus energy-water-waste story was confirmed in this sample. |

## Current article quality

- [Industrial electricity costs](https://www.theguardian.com/business/2026/oct/19/electricity-costs-uk-steelmakers-worst-position-three-years-eu-rivals): relevant to manufacturing; useful supporting energy coverage.
- [Gasfield approval](https://www.theguardian.com/environment/2026/oct/20/jackdaw-north-sea-gas-field-to-get-go-ahead-in-blow-to-climate-campaigners): direct project coverage; a strong oil-and-gas lead.
- [Stock-market report](https://www.theguardian.com/business/2026/oct/22/stock-markets-drop-ai-oil): oil-price context is useful, but equities dominate the story.
- [Preparedness opinion](https://www.theguardian.com/commentisfree/2026/oct/08/stockpile-food-wash-hands-how-to-prepare-environmental-catastrophe): water relevance exists; better supporting analysis than the only sector lead.

The water placement was caused by the single phrase `water` in the saved teaser.
That is evidence of a word match, not a recorded assessment of the article's
primary industry. The page also presents the column under **Latest industry news**
without a separate opinion label. Its publication date is almost sixteen days old;
the recent refresh timestamp does not make the article newly published.

The steel article legitimately appears in two related sectors. That overlap is
reasonable, but it does not demonstrate two independent sources of coverage.

## Why the current results are incomplete

### Discovery queries exclude relevant wording

Several existing queries require a sector term **and** one of a small number of
sustainability words in the same search. A datacenter pollution story, a circular
building project or an EV-adoption report may never enter the saved pool.

Broadening the queries helped, but also returned entertainment, war, lifestyle
and other irrelevant stories. One banking-prefix probe even matched *Rosebank*.
The thirteen probe queries are diagnostic examples, not production-ready replacements.

### General-topic approval does not establish industry relevance

The thirteen broader queries returned 83 candidates, or 71 distinct URLs. Twenty-one
distinct candidates passed the current general-topic rules; fourteen were not
already in the approved saved pool. Those fourteen are a shortlist, not fourteen
publication-ready industry stories.

The rules omit important contexts including electric vehicles, heat pumps, drought,
sewage, mine-related ground impacts and some biodiversity conflicts. They can also
approve an article for energy because a university appointment story mentions oil
and gas. Sector suitability needs its own recorded decision.

The current connector requests categories and title queries. It does not yet pass
`industry.id` or retain returned industry classifications. APITube documents
[industry filtering](https://docs.apitube.io/platform/news-api/industry), but an
industry label must remain evidence for review rather than an automatic publication decision.

### Structured industry filters help discovery but still produce weak matches

| Diagnostic filter | Returned | Interpretation |
| --- | ---: | --- |
| Finance IDs `399,423,440` plus sustainability terms | 1 | Its short metadata did not establish a financial-industry story. |
| Health/education IDs `549,556,322` plus sustainability terms | 0 | No matching candidate in this tested publisher/window/query combination. This does not establish that APITube has no health-sector coverage. |
| Water/waste IDs `398,397,395` | 10 | Included useful water-management candidates alongside animal incidents, war stories and broad nature coverage. |

The water response tagged shark and alligator incidents as **Water**. That is not
adequate evidence for a water-management/circular-economy news panel.

The [industry directory](https://docs.apitube.io/platform/news-api/list-of-industries)
has repeated labels: IDs `374` and `397` both use **Waste Management** with different
scope descriptions. Build reviewed mappings from IDs and scope, rather than names
alone. The zero-result health probe remains a limited sample, not a conclusive
vendor-coverage test.

### Publisher diversity remains weak in the displayed sample

The broader probes returned Guardian and BBC candidates. A separate, unqualified
BBC check returned ten recent English articles, so BBC access is demonstrably
available. None currently appears in an industry news panel.

The equivalent Reuters check returned zero. This is specific to the supplied
account, 31-day window and tested domain; it does not prove a permanent absence
from APITube. Confirm account/source coverage before relying on Reuters for diversity.

### The news link currently mixes content types

All thirteen **View All Industry News** links preserve the industry but omit
`type=news`. Their destinations show research and official updates as well.
Those results are useful, but they must not be counted as evidence that an empty
industry news feed has been filled.

## Recommendation and work to do

Do not switch production or select a paid plan based on the number of available
filter parameters. APITube has promising material, but the current pipeline misses
relevant stories and lacks reliable primary-industry classification.

The [plan table](https://apitube.io/us/pricing) describes the Free plan's ten
results per request and twelve-hour delay. More results or faster access can help
collection, but an upgrade alone will not fix the relevance and placement defects
demonstrated here. This is one point-in-time evaluation using selected publishers,
not a complete search of every article in the provider's catalogue.

- [ ] **P1 — Sector decisions:** distinguish a story's main industry from incidental
  mentions; save the assigned sector and the evidence for the decision.
- [ ] **P1 — Retrieval:** add sector-specific discovery variants, verify live
  industry IDs, and retain provider industry evidence. Keep publisher and access gates.
- [ ] **P1 — Screening:** cover the missing sustainability contexts with positive
  and negative examples from this audit. Keep fiction, metaphorical matches and
  unrelated university/animal stories out of the relevant sector panels.
- [ ] **P1 — Recheck candidates:** review the promising probe candidates, verify
  anonymous access, then save through the normal collection pipeline. They remain
  unpublished in this audit.
- [ ] **P2 — Ranking:** prefer a strong primary-sector lead over a newer general
  market report; avoid filling a carousel with several angles on the same event.
- [ ] **P2 — Content labels:** identify opinion/analysis and distinguish publication
  age from refresh age.
- [x] **P2 — News navigation:** industry news destinations now include `type=news`;
  the government hero and Global Intelligence share its contextual selection rule.
- [ ] **P2 — Empty state:** consider a shorter news area while retaining the
  industry heading and narrative; nine full-height empty heroes make coverage look unfinished.
- [ ] **P2 — Coverage trial:** after the fixes, track all thirteen sectors for
  seven days. Record relevant saved stories, age, publishers, region, failures and
  request cost. Compare another provider separately using the same conditions.

Suggested evaluation targets, not new client requirements: two clearly related
stories per sector within thirty days, at least one within seven days, no obvious
off-topic leads, and more than one publisher across each sector's weekly sample.
Flag genuinely quiet sectors explicitly instead of inserting weak stories to meet a count.

The trial has one request left under today's internal cap. Repeat collection after
the next UTC daily reset or within the existing budget; do not increase the limit
merely to repeat this audit.

## Evidence and repeatable checks

- [Saved feed and matched phrases](feedback/APITUBE-INDUSTRIES-SAVED-2026-10-24.json)
- [26 industry views and 13 news destinations](feedback/APITUBE-INDUSTRIES-BROWSER-2026-10-24.json)
- [Thirteen broader industry probes](feedback/APITUBE-INDUSTRIES-PROBES-2026-10-24.json)
- [Industry-filter and source-availability probes](feedback/APITUBE-INDUSTRY-FILTERS-2026-10-24.json)
- [Screenshot directory](feedback/apitube-industries-2026-10-24)
- `scripts/audit-apitube-industries.ts`: database-only audit by default; `--probe`
  makes thirteen budgeted diagnostic requests without publishing.
- `scripts/audit-apitube-industry-pages.mjs`: inspect the running local site with
  the configured Playwright module and Chrome executable.
- `scripts/audit-apitube-industry-filters.ts --manual`: five budgeted filter probes.

The audit scripts passed TypeScript and ESLint checks. No product-code change,
additional news publication, merge or deployment was made for this review.
