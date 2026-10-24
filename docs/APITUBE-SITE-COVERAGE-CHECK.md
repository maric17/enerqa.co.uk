# APITube fetching and coverage assessment — 24 October 2026

Later on the same date, the [all-industry correction](APITUBE-ALL-INDUSTRIES-FIX-2026-10-24.md)
completed the remaining targeted ingestion and verified every hero and news
destination at desktop/mobile sizes. Current local coverage is thirteen of
thirteen industries. The figures and conclusions below preserve the earlier
diagnostic assessment; they are not the current saved counts.

## Result

APITube has promising candidate coverage for the four domains, market commentary,
and all thirteen industries. The current retrieval and screening are not ready
for the proposed complete scheduled refresh. This is a point-in-time sample,
not a guarantee of sufficient fresh articles every day or a production change.

The user updated the local key after the morning audit was blocked. The free
`/v1/balance` check then confirmed a live Free account with 100 points available.
Forty-six budgeted diagnostic searches completed successfully. No candidate was
published and no cron, default provider limit or publisher allowlist was changed.
The final private account check confirmed **67 points remaining**: the news tests
used 33 provider points because successful empty searches did not spend points.

## What was tested

| Test | Requests | Returned placements | Result |
| --- | ---: | ---: | --- |
| Current connector: four domains, three markets, thirteen industries | 20 | 18 | Sparse. Business, London and regional markets were empty; only three dedicated industry searches returned anything. |
| Same queries, categories, window lengths and first-page limit, with source restriction removed | 20 | 200 | Every search returned ten candidates. There were 189 distinct URLs across 144 publishers; relevance and publisher suitability varied. |
| Tighter finance, water and estates queries, each with and without industry IDs | 6 | 52 | Tags changed the sample but did not consistently improve relevance. Strict estates tags removed a useful university procurement story. |

A placement is one result in one search. The same article can appear in several
searches. The ten-result page is a bounded sample, not an exhaustive archive.
The two twenty-search runs were close in time but did not use identical absolute
start/end timestamps. Their configured window lengths, queries and categories
were the same; source restriction was the intentional comparison variable.

The unrestricted candidates in this first-page sample are **all outside the current
publisher allowlist**. They are discovery evidence, not automatically publishable
stories. Removing `source.domain` in production would not make these articles
appear under the existing publication rules.

Evidence:

- [Current connector, twenty searches](feedback/APITUBE-SITE-COVERAGE-2026-10-24T07-37-03-556Z.json)
- [Wider-source comparison, twenty searches](feedback/APITUBE-SITE-COVERAGE-2026-10-24T07-42-33-793Z.json)
- [Six targeted query/industry-tag comparisons](feedback/APITUBE-TARGETED-COVERAGE-2026-10-24T07-47-58-195Z.json)
- [Assessment with twenty section examples and nine rejected or unsuitable matches](feedback/APITUBE-COVERAGE-ASSESSMENT-2026-10-24.json)

## Domains and stock commentary

| Section | Current search returned | Wider search returned | Assessment |
| --- | ---: | ---: | --- |
| Climate | 7 | 10 | Clear impacts, policy, resilience and climate-finance candidates. Separate labels are needed for commentary and events. |
| Energy | 1 | 10 | Wider sources add solar projects, grid development and utility activity. Current vocabulary misses some virtual-power-plant and tidal-energy stories. |
| Environment | 2 | 10 | Wider sources add extraction/river impacts, circularity and biodiversity coverage. Syndicated stories and research/events need grouping or separate labels. |
| Sustainable Business, ESG & Finance | 0 | 10 | Responsible sourcing, climate finance and green bonds are available. An ESG recruitment advert and publisher branding also pass current topic rules. |
| US/global markets | 4 | 10 | Three baseline results pass market rules. Wider search also includes chart posts, product reviews and stock-picking comparisons. |
| London | 0 | 10 | Direct FTSE reporting exists. Current stock vocabulary omits words such as “slips”; some clear market reports fail the market-topic rule. |
| Regional | 0 | 10 | Direct Indian and European market reporting exists. This sample does not establish separate Gulf, African or East Asian coverage. |

The business domain's existing saved story concerns corporate environmental
obligations. Its presence did not establish financial-institution coverage. The
new sample includes [bank financing for nature-based solutions](https://www.myjoyonline.com/cbg-calls-for-increased-climate-finance-to-scale-nature-based-solutions-in-ghana/)
and [responsible supply-chain services](https://www.esgtoday.com/lrqa-acquires-supply-chain-monitoring-and-responsible-sourcing-platform-omega-compliance/).
Their original pages were inspected for subject relevance; neither was approved
or saved for publication by this assessment.

## All thirteen industries

Every wider dedicated industry search returned ten candidates. That count alone
is not a relevance score. The examples below show plausible subject coverage;
some were found by another search in the shared pool.

| Industry | Current dedicated search returned | Useful candidate/context | Main issue |
| --- | ---: | --- | --- |
| Government | 0 | EU methane legislation; tidal-project government support | Include legislative/agency terminology and distinguish policy from incidental institutional mentions. |
| Finance / investors / development finance | 0 | Bank financing for nature-based solutions | Structured finance tags still include a council climate-risk report without a clear finance-industry focus. |
| Energy & utilities | 0 | Utility renewable-energy-credit contracts supporting a solar project | Do not require the same generic words in every relevant headline; broaden specific energy vocabulary. |
| Oil, gas & petrochemicals | 0 | Gasfield approval and energy-security reporting | Separate direct industry reporting from general stock/oil context. |
| Manufacturing & materials | 1 | Funding to expand battery manufacturing | “AI factory” and research-paper references are not automatically manufacturing news. Group syndicated copies. |
| Infrastructure & real estate | 0 | Low-carbon concrete for datacenter construction | This useful building-materials story was found by the technology search. Add embodied-carbon and retrofit discovery paths. |
| Transport & mobility | 0 | TfL zero-emission vehicle consultation | A strong policy/transition story fails both current topic screening and page phrase matching. |
| Water, waste & circularity | 2 | Wastewater-facility investment and recycling systems | Both baseline results are weak sector matches. Tighter water-service terms are substantially more useful. |
| Agriculture & food | 1 | Smallholder agricultural-adaptation finance | Distinguish production/adaptation from alumni awards, application calls and unrelated preparedness opinion. |
| Mining & natural resources | 0 | Mining impacts on Amazon river resources | Most wider dedicated results are generic energy stories containing “Mining News” in publisher branding. A strong direct-impact story was found by the environment query. |
| Tourism & hospitality | 0 | Hotel clean-energy financing and a green-hospitality initiative | Promotional sustainability announcements need labels and evidence; generic travel/climate descriptions are poor matches. |
| Technology & data infrastructure | 0 | Datacenter water demand and low-carbon construction | Syndicated repeats can fill most of a ten-result page. Specific resource-use contexts are missing from screening. |
| Healthcare / education estates | 0 | Hospital renewable-power procurement; university renewable-energy procurement | Do not confuse university research, curriculum or an AI “campus” with institutional-estate operations. |

Selected original pages were opened to check relevance, including
[transport policy](https://transportandenergy.com/2026/10/22/tfl-launches-consultation-on-zero-emission-private-hire-vehicles/),
[hospital power procurement](https://logisticsnews.ph/2026/10/22/mtcmc-first-gen-renewable-energy-rap-pampanga/),
[university renewable procurement](https://news.wfu.edu/2026/10/23/solar-energy-center-begins-operations-with-support-from-wake-forest-university/),
[hotel energy financing](https://entebbenews.net/energy-ministry-unveils-green-hospitality-plan-as-equity-bank-backs-financing-solutions/),
[construction emissions](https://betakit.com/low-carbon-concrete-could-lower-emissions-before-data-centres-even-go-online/),
and [extraction-related water impacts](https://news.mongabay.com/2026/10/amazon-communities-lose-water-as-mining-and-deforestation-reshape-rivers/).
These page inspections are separate from the application's automated access gate;
no `verified_open` record or publisher approval was created.

## What industry parameters actually did

| Precise query | Without industry IDs | With industry IDs | Interpretation |
| --- | ---: | ---: | --- |
| Finance | 10 | 10 | IDs `399,423,440` retain useful bank/climate-finance candidates, but also a council climate-risk report. |
| Water/waste | 10 | 10 | IDs `398,397,395` help find utility services and recycling, but may exclude useful records tagged with the other Waste Management scope, ID `374`. |
| Health/education estates | 10 | 2 | IDs `549,556,322` remove the university renewable-procurement example. The two remaining results concern a waste centre and an academic programme; they do not establish strong estates coverage. |

APITube tagged the useful Wake Forest procurement article with **Fuel** and
**Natural resources**, rather than a requested healthcare/education ID. The
unrestricted original industry search also found a hospital renewable-power
contract. Requiring the industry ID everywhere would therefore hide relevant
stories. Tags should support classification and ranking, with a focused-query
alternative and local context checks.

The [provider's industry directory](https://docs.apitube.io/platform/news-api/list-of-industries)
has repeated names with different scope descriptions. Compare IDs and their
meaning; do not map by label alone. Most list filters accept only three values.

## What to change before cron

1. Use suitable source groups for each topic/industry instead of one universal
   Guardian/BBC/Reuters group. Review proposed additions individually. Do not
   publish every unrestricted result or remove the access/publisher gates.
2. Improve focused discovery terms and use cross-topic collection deliberately.
   Keep industry tags as evidence rather than an obligatory match in every search.
3. Save domain, industry and market assignments with the exact reviewed text and
   matching evidence. Require a substantive sector connection before display.
4. Cover demonstrated missing contexts: tidal energy, virtual power plants,
   fleet emissions, water supply, wastewater, hospital procurement and building
   efficiency. Do not accept a topic solely because it occurs in publisher branding.
5. Separate adverts, research, events, opinion and press releases from ordinary
   news where appropriate. Group duplicate events and syndicated copies. Check
   original publication dates before calling a story fresh.
6. Recheck approved candidates through the normal publisher-access and database
   pipeline, then verify actual cards on all thirteen industry pages.

No additional AI service was called for these tests. Better explicit rules and
provider metadata can implement these improvements, but parameters alone did not
provide reliable final industry assignments in this sample.

The two CLI twenty-search audits took approximately **305 and 307 seconds**,
including their database reads and report writes. These durations were derived
from report creation/final-write times, not a production-ingestion benchmark. They
omit publisher access checks and news storage. The current 300-second route has
insufficient demonstrated headroom for a full refresh; use resumable batches or a
background worker when implementing the master job. Twenty calls is a survey
baseline, not a final production budget after source groups, pagination and retries.

## Repeatable commands and request accounting

```sh
# Read saved feeds and write the twenty-search plan without fetching news.
npx tsx scripts/audit-apitube-site-coverage.ts

# Exercise the current connector when the normal app allowance permits the batch.
npx tsx scripts/audit-apitube-site-coverage.ts --manual

# After a replacement key/plan, verify live points and grant only this CLI batch extra slots.
npx tsx scripts/audit-apitube-site-coverage.ts --manual --verified-account-budget

# Compare the same searches across all sources for diagnosis only; do not publish this sample.
npx tsx scripts/audit-apitube-site-coverage.ts --manual --verified-account-budget --all-sources

# Compare three tighter sector queries with and without industry tags; six diagnostic calls.
npx tsx scripts/audit-apitube-targeted-coverage.ts --manual
```

The explicit fresh-account mode checks the free `/v1/balance` endpoint, requires
sufficient live points and leaves five points as headroom. It temporarily grants
only the selected batch's slots in the audit process. Shared request history and
request spacing remain active. The normal 80/day limit in `health.ts` is unchanged
and restored in the CLI process on exit. No ledger entries are cleared. The
aggregate ledger increased **79 → 125** across forty-six news requests spanning
the earlier and replacement account usage; this is not the replacement account's
point consumption. Empty searches may cost no provider points.

All watched news/refresh-control record fingerprints stayed unchanged. Other
news-provider request counts stayed unchanged during each batch. The public saved
industry coverage remains **five of thirteen**, because this assessment did not
publish candidates. Earlier browser checks and screenshots remain historical;
this assessment does not claim to have rendered new diagnostic stories.

The [post-audit saved-feed check](feedback/APITUBE-POST-COVERAGE-SAVED-2026-10-24.json)
reports `legacyRecordsUnchanged: false` against the earlier morning baseline.
That comparison spans time before this assessment: the first live audit already
had 335 historical TheNewsAPI requests, compared with 311 in the morning report.
The unchanged-during-batch checks above remain true; do not describe the entire
day's legacy database as unchanged. The post-check made zero news API calls and
confirmed fourteen approved APITube records and the same five populated industries.

Validation: TypeScript, ESLint for both audit scripts and 31 focused existing
connector/pipeline tests passed. Generated reports were checked for key exposure;
the key is absent. The running web server was not restarted or stopped.

## Remaining work

- [x] Updated key accepted; live account allowance verified privately.
- [x] Twenty current searches, twenty wider-source searches and six tag comparisons completed.
- [x] Relevant examples and unsuitable matches documented for all sections.
- [ ] Select suitable new publisher groups and improve demonstrated query/screening gaps.
  - Next action: test the proposed source groups against this recorded sample.
- [ ] Verify access, save approved candidates and check actual displayed coverage.
  - Next action: use normal ingestion, then inspect all thirteen industry feeds and stock destinations.
- [ ] Measure a complete ingestion run and implement resumable scheduled refresh.
  - Next action: benchmark the final queries, retries, access checks and writes together.
- [ ] Confirm sustained freshness, publisher and regional diversity over seven days.
  - Next action: record daily coverage instead of treating this single sample as a guarantee.

References: [search endpoint](https://docs.apitube.io/platform/news-api/everything),
[query/filter limits](https://docs.apitube.io/platform/news-api/query-builder),
[industry endpoint](https://docs.apitube.io/platform/news-api/industry),
[free balance verification](https://docs.apitube.io/platform/news-api/balance).
