# CMS-managed Relevant Industries

Implemented and populated on 18 October 2026.

## Behavior

Domain pages now use their saved Payload `relevantIndustries` relationship directly, like Capabilities. Editors can add, remove and reorder industries under Admin → Domains → select a domain → Relevant Industries → Save. Clearing the selection leaves only Explore All Industries.

The page no longer replaces saved selections with `APPROVED_DOMAIN_INDUSTRIES`. That mapping supplies initial content only. The CMS query runs at request time so saved changes appear on a subsequent page request without a rebuild. Relationship population still supplies real industry titles and canonical links; unresolved numeric relationships are withheld.

## Initial content

All four relationship fields were empty before this change. The approved Q14 values were populated in the existing shared database:

| Domain | Industries |
| --- | ---: |
| Climate Action & Carbon Management | 7 |
| Energy Systems & Transition | 10 |
| Environment, Nature & Circularity | 9 |
| Sustainable Business, ESG & Finance | 8 |
| Total | 34 |

`scripts/questionnaire/populate-domain-industries.mjs` previews by default; `--apply` fills empty fields in a single transaction. It validates every domain/industry reference, locks parent records during application and writes a private backup under the ignored `scripts/questionnaire/backups/` directory. It does not overwrite existing nonempty selections. This is an explicit population tool, not a request-time fallback.

No schema migration or schema push was used. Only the industry relationships and affected domain modification timestamps changed. Before/after checksums confirmed that other domain content and other relationships, including Capabilities, stayed identical.

## Validation

- [x] Database connectivity and read-only checks passed before population.
- [x] Reviewed the preview, then populated all 34 relationships successfully.
- [x] Read-back matched every approved industry slug in its exact order.
- [x] Second application populated zero domains and preserved the saved selections.
- [x] Deployed Payload API returned HTTP 200 with all four populated relationships, resolved titles/slugs and the expected order.
- [x] Seven focused page tests passed. They cover CMS selections for all four domains, editor ordering, empty selections, unresolved IDs and the request-time boundary. Six failed against the previous override before the implementation changed.
- [x] TypeScript, changed-file ESLint and whitespace checks passed.
- [x] Production build passed with `PAYLOAD_SCHEMA_PUSH=false` and `next build --webpack`; `/domains/[slug]` is classified as dynamic. The initial default Turbopack attempt stalled during compilation and was stopped; no bundler configuration was changed.
- [x] All four pages returned HTTP 200 from the local production server. Rendered cards matched the saved selections and exact order: Climate 7, Energy 10, Environment 9, Business/ESG 8. Responses used `private, no-cache, no-store` headers. The temporary production server was stopped after verification.
- [ ] Deploy the CMS-driven page implementation.
  - Next action: deploy these code changes, then verify a saved admin selection controls the public cards. The shared CMS values are already populated, but the deployed page override remains until the new code is deployed.
