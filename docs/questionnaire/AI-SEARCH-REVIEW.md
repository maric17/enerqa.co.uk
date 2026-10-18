# AI search decisions and first catalogue draft — deferred

**Latest user instruction, 3 October 2026:** disregard AI search for now because there is no API key. Keep it disabled and defer all AI launch work; the ownership question does not block the current non-AI website work. The previously prepared draft is retained for a future restart.

Questionnaire Q22–Q24, recorded 3 October 2026. Source: the separate [AI Search handoff](../reenerqawebsitedeveloperhandoff/Enerqa_AI_Search_Developer_Handoff.txt). Its full implementation remains tracked in [AI-SEARCH-TASKS.md](../AI-SEARCH-TASKS.md).

**Budget confirmed: USD 50 each calendar month.** Configured targets are warning at USD 25 and USD 40, restriction at USD 45 and a stop at USD 50. These numbers are recorded in server configuration. They do not yet enforce spending. Keep both the provider flag and `releaseReady` false until shared reservations and reconciliation are deployed and tested.

## Review the company wording

[AI-CATALOGUE-DRAFT.json](AI-CATALOGUE-DRAFT.json) contains 29 proposed service records, copied from the repository's approved domain capability narratives. Each gives its canonical domain/anchor destination and source. The URL registry contains the four domain pages, project-development page, Contact and project-enquiry route. No invented clients, completed projects, credentials, pricing or experience claims are added.

All records are **draft**, approval names/dates are empty and company promotion is disabled. Confirm the exact approved text, active date and allowed URLs for each record. Carbon-market services require explicit approval under the AI handoff even though their website narratives already exist. This file is a review artifact; it is not loaded by the search endpoint and does not masquerade as the required filtered vector retrieval.

## What “owners and deputies” means

This asks who receives a problem and who covers them if they are unavailable. It does **not** require six new employees. One person can cover several jobs, and the engineering supplier can handle technical work if agreed.

| Job | Simple responsibility | Named person | Backup |
|---|---|---|---|
| Product | Decide what search should do and approve the $50 spend | To name | To name |
| Content | Approve service wording and remove inaccurate claims | To name | To name |
| Engineering | Maintain code, credentials and budget controls | To name | To name |
| Testing | Check answers, sources and releases before launch | To name | To name |
| Operations | Receive outage/spending alerts and switch search off | To name | To name |
| Privacy | Handle privacy questions and approve data handling | To name | To name |

Islam Abuhiss is confirmed as the **policy approver**, not automatically as the owner of all six jobs. The public privacy mailbox is info@enerqa.co.uk; a mailbox alone does not identify its responsible person.

## Release work still required

1. Approve the catalogue/URL registry and policy, and name the contacts above.
2. Restore database access; implement and verify server-issued same-site sessions, atomic rate/concurrency counters, request idempotency and the durable monthly reservation/settlement ledger. Test a duplicate request, cancellation, provider timeout and exhausted budget without paid calls first.
3. Configure the OpenAI account and key, recheck the handoff's model availability and current billing rates, and run an authorised staging smoke test. No paid request was made in this questionnaire pass.
4. Complete moderation, conversation expiry/clearing, grounded company retrieval, structured classifier and deterministic promotion policy, source access checks, opt-out/cooldown, dashboards/alerts and the runbook.
5. Run the handoff's evaluation set of at least 250 labelled questions and its acceptance gates before the traffic ramp. Do not count a parser unit test as a quality evaluation.

The request to follow the whole handoff is recorded. AI launch cannot be marked complete from budget approval alone. The detailed work remains explicitly open on the AI task board, with the supplied answers replacing the old unanswered budget question.
