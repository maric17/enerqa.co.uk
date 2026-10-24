# All-industry APITube correction — 24 October 2026

Later update: [separate general, stock and industry jobs](APITUBE-SPLIT-NEWS-JOBS-2026-10-24.md)
are now implemented and tested locally. Activation and a real scheduled-cycle
verification remain pending. This report preserves the ingestion/browser evidence.

All thirteen industry pages now have qualifying saved news on the local
`trial/apitube-news-2026-10-24` branch. This corrects the seven feeds left empty
after the tourism repair. No merge, deployment or cron activation is included.

## Saved and displayed coverage

| Industry | Hero stories | News-results stories |
| --- | ---: | ---: |
| Government, Regulators & Public Institutions | 3 | 3 |
| Financial Institutions, Investors & Development Finance | 3 | 8 |
| Energy & Utilities | 2 | 2 |
| Oil, Gas & Petrochemicals | 2 | 2 |
| Industry, Manufacturing & Materials | 1 | 1 |
| Infrastructure, Real Estate & Industrial Zones | 1 | 1 |
| Transport, Logistics & Mobility | 1 | 1 |
| Water, Waste & Circular Economy | 3 | 3 |
| Agriculture, Food & Aquaculture | 1 | 1 |
| Mining & Natural Resources | 2 | 2 |
| Tourism, Hospitality & Destinations | 1 | 1 |
| Technology, Telecoms & Data Infrastructure | 1 | 1 |
| Healthcare, Education & Institutional Estates | 1 | 1 |

The hero displays at most three stories. Articles can legitimately appear in
several industries: the low-carbon-concrete/data-centre story belongs to both
infrastructure and technology. These are placements, not distinct article totals.
The database contains 29 approved, anonymously readable APITube articles and one
withheld unknown-access record. Four domain feeds each have three qualifying
stories. Existing stock coverage remains three saved stories; dedicated London
and regional coverage is still unproven.

## Retrieval and screening changes

Six publisher domains were reviewed in fresh, unauthenticated browser contexts
before being added to the allowlist: MyJoyOnline, BetaKit, Transport + Energy,
AgroNigeria, Mongabay and Logistics News PH. The reviewed original articles
returned HTTP 200 and readable content without required login or subscription.
Each industry discovery query still requests no more than three approved domains.
The default topic and market publisher group is unchanged.

The seven repaired industries now require a sector subject in the main headline
and a relevant climate, energy, environmental or operational context in the
headline/short licensed teaser. Publisher-name suffixes do not count as headline
subjects. Tests cover unrelated research, product announcements, rhetorical food
mentions and misleading publisher suffixes. Transport policy screening also
recognizes vehicle-emissions measures when supported by APITube categories.

Targeted discovery applies these rules before storing a candidate. The saved
teaser is normalized to 200 characters before this check, so evidence outside
the published text cannot qualify a story. Every approved record has versioned
industry assignments bound to its exact saved title and teaser. Page heroes and
news-only Global Intelligence destinations use the same classification rules.
No third-party AI service is involved. These rules reduce false matches; they
cannot guarantee perfect editorial judgment.

## Actual ingestion and isolation

Seven normal targeted ingestion requests succeeded, returning 26 candidate
placements. Fifteen placements qualified, representing fourteen new unique
articles. The run also rechecked existing approved stories: its 29 stored items
are not 29 newly discovered stories. Access checks, database writes and the
trial's shared refresh lease remained active.

The operator command supports a validated comma-separated list of industry
slugs. After checking the updated account's live allowance, it temporarily
grants only the selected request slots in that command process. The default
80-request daily cap remains unchanged. The shared local ledger moved from
127 to 134 APITube requests; changing a key does not reset that ledger. Other
provider usage and legacy/production-control fingerprints stayed unchanged
during this repair. A broader morning-baseline fingerprint differs from changes
already present before this repair; use the scoped isolation evidence below.

## Validation and evidence

- 724 tests across 91 files passed; TypeScript and targeted ESLint passed.
- All thirteen heroes and their actual news-results destinations passed at
  1366px and 390px: 52 browser checks. Each returned HTTP 200, with expected news
  counts, correct saved article links, no horizontal overflow and no JavaScript
  errors. Browsing spent zero news API requests and did not invoke live search.
- Desktop/mobile screenshots were saved for all thirteen industries; transport,
  mining, infrastructure and healthcare images were also visually inspected.
- [Saved-feed counts and article URLs](feedback/APITUBE-ALL-INDUSTRIES-SAVED-2026-10-24.json)
- [Browser results](feedback/APITUBE-ALL-INDUSTRIES-BROWSER-2026-10-24.json)
- [Scoped request and record isolation](feedback/APITUBE-ALL-INDUSTRIES-ISOLATION-2026-10-24.json)
- [Seven-request ingestion results](feedback/APITUBE-REMAINING-REFRESH-2026-10-24.json)
- [Publisher-access review](feedback/APITUBE-INDUSTRY-PUBLISHER-REVIEW-2026-10-24.json)
- [Example mobile healthcare screenshot](feedback/apitube-all-industries-2026-10-24/healthcare-education-institutional-estates-390.jpg)

## Remaining work before a public switch

- Observe repeated scheduled-size batches after the daily quota reset. Some
  industries have only one story, and the current sample does not establish
  reliable fresh coverage every day. The Free feed remains delayed by 12 hours.
- Assess London and regional stock discovery separately.
- Set a cron frequency and request budget that fit the account allowance and
  measured route runtime, then verify actual scheduled execution. No cron was
  deployed or enabled by this repair.
- Review the trial before any merge or deployment. Main and production remain
  outside this change.
