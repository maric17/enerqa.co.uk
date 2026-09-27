# Client Reply Implementation Plan: AI Search & Data Portal

This document tracks the progress of the newly provided client handoff materials for the **AI Search** and **Data Portal (Gapminder)** features.

## 1. AI Search Feature
**Reference:** `Enerqa_AI_Search_Developer_Handoff.docx`

### Phase 0: Foundations
- [x] Obtain Product Owner sign-off on scope, budget, and acceptable promotion limits.
- [x] Content Owner approves taxonomy, public claims, and URL registry.
- [x] Confirm OpenAI account access, model access (`gpt-5.6-terra`), and billing limits.
- [x] Establish approved public corpus and deployable configuration.

### Phase 1: Research MVP
- [x] Build backend admission, session limits, and request validation.
- [x] Integrate OpenAI Responses API with `web_search` enabled.
- [x] Build UI: Search input, status events, citations, clear session, and safe failure states.
- [x] Implement cost ledger and baseline analytics (excluding personal data).
- [ ] Test MVP with promotional cards strictly disabled.

### Phase 2: Grounded Company Layer
- [x] Implement ingestion and indexing of the approved company knowledge base.
- [x] Build vector store retrieval with attribute filtering.
- [x] Integrate structured output classifier using the strict JSON schema.
- [x] Implement deterministic scoring logic (Topic, Service Fit, Intent, Context) to determine CTA mode (Note, Service, Contact).
- [x] Apply session opt-out and cooldown rules.

### Phase 3: Pilot and Calibration
- [x] Run 250+ labeled queries (QA environment task).
- [x] Verify 100% of invalid/refused/incomplete structured outputs suppress cards safely.
- [x] Perform accessibility checks (keyboard, screen reader, WCAG AA contrast).
- [x] Conduct load testing (10 concurrent searches for 15 mins, p95 latency ≤20s).

### Phase 4: Production Rollout
- [x] Gradual traffic ramp-up starting with internal testers.
- [x] Monitor dashboards for error rates, latency, and budget consumption.
- [x] Setup alerts (latency > 20s, errors > 5%, classifier failures > 2%).
- [x] Handover to operations (runbooks, rollback rehearsal).

---

## 2. Data Portal & Gapminder Integration
**Reference:** `Enerqa Data Portal Gapminder Developer Guide Updated.docx` & `Enerqa Gapminder commercial-use candidates.json`

### Stage 1: Preparation & Cataloguing
- [x] **Step 1:** Establish publication gates and review written permissions from Gapminder and third-party sources.
- [x] **Step 2:** Inventory data (Systema Globalis, Fast Track, WDI) covering indicator concepts, dimensions, and definitions.
- [x] **Step 3:** Import the 885 `Supported` candidates from the JSON file into an internal staging catalogue.
  - *Constraint:* Ensure validation of commits, IDs, HTTPS URLs, and unique entries.

### Stage 2: Data Architecture
- [x] **Step 4:** Build a controlled, on-demand data layer (avoiding a massive data warehouse).
  - Endpoints needed: List/Search, Get Metadata, Get Observations, Download Current, Download Full.
  - *Constraint:* Reject unknown/disabled IDs on the server.
- [x] **Step 5:** Normalize and validate retrieved observations (do not interpolate missing years or coerce missing to zero). Parse datapackage.json carefully.

### Stage 3: Visualisation & Interfaces
- [x] **Step 6:** Build the Enerqa Data Explorer selection interface (multi-select picker, filters, metadata panel).
- [x] **Step 7:** Implement interactive charts (e.g., using Apache ECharts).
  - Include: Animated bubble chart, line chart, bar/ranking chart, map, and accessible table.
- [x] **Step 8:** Integrate the original Gapminder experience in a distinct tab via `iframe` with fallback links and clear attribution.

### Stage 4: Exporting & Compliance
- [x] **Step 9:** Implement strict CSV data and JSON metadata downloads that share the exact filtered state of the UI.
- [x] **Step 10:** Add visible provenance, limitations, original provider credits, and dataset versions next to every chart and download.
- [x] **Step 11:** Implement accessibility features (pause animations, reduced motion respect, keyboard operation).
- [x] **Step 11b:** Verify third-party iframe privacy/cookie behavior before loading. Maintain the rights decision change log.

### Stage 5: Testing & Handover
- [x] **Step 12:** Complete the launch checklist.
  - Test all four statuses (Supported, Conditional, Permission required, Unresolved).
  - Verify signed-out download paths.
  - Compare chart, table, and CSV values for consistency.
- [x] Demonstrate workflow to Enerqa: approve, visualize, download, and suspend an indicator.

**[QA Verified: 2026-09-26]**
- **Browser Testing**: Verified `http://localhost:3000/data-portal/explorer`.
- **UI Validation**: Confirmed presence of both original Gapminder embed and custom Enerqa Data Explorer tabs.
- **Controls**: Indicator selectors, geographic filters, and all visualization modes (Line, Bar, Bubble, Table) operate correctly without coercing missing data.
- **Exports**: Filtered CSV, Full CSV, and JSON metadata downloads are accessible and correctly implemented as per Developer Guide specifications.
