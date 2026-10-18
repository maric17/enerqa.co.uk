# Enerqa client meeting brief — 11 October 2026

Prepared from [HANDOFF-TASKS.md](HANDOFF-TASKS.md), the newer [questionnaire status](questionnaire/STATUS.md), [operational setup](questionnaire/OPERATIONS.md), [publication relationship evidence](PUBLICATION-RELATIONSHIPS.md), and Part 12/13 verification reports.

This is a document review. It does not recheck live service accounts or production deployment. The board contains older unresolved rows that newer records supersede. Use the questions below instead of resending the historical blank questionnaire.

## Start with launch scope

Suggested opening: “Several decisions are already settled. Today we need the remaining materials, named owners and approval dates. Can we agree which features must be available at the first launch and which can follow?”

Confirm how to handle tools without working releases, careers, Arabic, optional analytics and additional data sources. A missing item can delay its feature without necessarily delaying the whole website. AI search is already deferred and does not need a new decision in this meeting.

## Questions to ask

| Priority | Topic | Ask the client | Required outcome and release handling |
|---|---|---|---|
| 1 | Tools — Q18/Q19; Parts 10 and 12.5 | “Can you provide the working files or app links and the approved documentation for ESG Readiness Tool, easySOLAR and GreenScale Pro? Which of the four additional tools should be included, and when will their releases be ready?” | A named tool owner, delivery date, approved names/versions, access instructions and documentation. Keep unavailable additional tools hidden; do not advertise a working download or app until tested. |
| 2 | Publication facts — Q15/Q16; Part 8 | “Who can confirm the 16 outstanding publication dates and the remaining author/co-author credits? Can they return one article-by-article list with source evidence?” | Confirmed dates and credits, with an owner and deadline. Keep unverified-date labels and avoid guessing dates or removing disputed co-authors. Three author identities are already settled; details below. |
| 3 | Account ownership and email delivery — Q8/Q9/Q26; Part 14.4 | “Who will be the primary and backup Enerqa administrators? Can the current administrators grant access to hosting, the database and SendPulse, and confirm the sending address and newsletter list?” | Named owners, individual account invitations, recovery responsibility, verified sender, mailing-list choice and a handover/training date. The developer configures and tests delivery before activating it. |
| 4 | ReliefWeb registration — Part 13.2 | “Which Enerqa email address should we use to request an approved ReliefWeb application name, and who will monitor the approval reply?” | A client-approved contact email, named registration owner and approved application name. Request it through the [ReliefWeb application-name instructions](https://apidoc.reliefweb.int/parameters#appname). The developer then sets `RELIEFWEB_APPNAME`, verifies report access and enables the provider only after those checks pass. |
| 5 | Privacy operations — Q2/Q3/Q13; Part 14.4 | “Who owns privacy requests and record deletion? How are enquiry/client records, mailboxes, exports and backups managed, and who will complete the outstanding privacy assessment?” | An operational owner and documented handling/backup arrangements. Enquiry retention and newsletter decisions are already approved; the remaining work is applying them across systems. Agree CV handling separately if careers is included. |
| 6 | Data and embedding approvals — Q20; Parts 9/13 and the Gapminder guide | “Who at Enerqa approves data-use evidence? Do you approve keeping the selected OWID/Ember datasets after the file-specific checks, or prefer approved-provider replacements? Is there written Gapminder permission or clarification for the intended commercial embed?” | A nominated reviewer, a keep/replace decision and any existing permission correspondence. The developer verifies exact files, versions, licences, credits and anonymous downloads. No blanket approval follows from a general provider licence or a ‘Supported’ catalogue label. |
| 7 | Careers — Q13; Part 12.9 | “Can you approve the prepared expert-roster text, confirm who handles careers@enerqa.co.uk, and decide how long CVs are kept and who can access them?” | Approved copy and CV-handling rules, or agreement to publish the page later. No invented vacancies. The proposed 12-month CV period in the draft is not yet approved. |
| 8 | Arabic — Q25; Part 14.2 | “Who will review the Arabic draft, which pages come first, and should the first release wait for Arabic or publish it in a later phase?” | Named Arabic reviewer, terminology/brand approval, page priority and review deadline. Only an initial translation batch exists; complete translation and page implementation remain development work. |
| 9 | Analytics hosting — Q10/Q26; Part 14.4 | “Who will own the self-hosted Umami service, where should it run, and who approves its hosting costs and updated service wording before activation?” | Hosting/account owner and activation plan, or agreement to keep analytics off for the first release. The 90-day raw-data and backup limit is already approved; do not ask for that decision again. |

## Supporting details to have ready

### Tool pack

For each tool, request its approved name, version and release date; real file or launch URL; licence and access conditions; inputs/outputs and units; calculation or scoring method; assumptions and limits; guide; and how user inputs are stored, shared or deleted.

The additional tools awaiting validation are **GHG365 / GHG Emissions Calculator, MRV Tool, ESIA Risk Assessment Tool and Green Project Scoring Tool**. A statement that they will become web apps does not supply a working release.

Sources: [board Part 10](HANDOFF-TASKS.md#part-10--tools-pdf-pp-162166), [Part 12 remaining tool content](PART-12-VERIFICATION.md#still-pending--reconciled-with-the-3-october-questionnaire), questionnaire Q18/Q19.

### Publication follow-up

The [original Q15 list](CLIENT-QUESTIONS.md#q15-when-was-each-of-these-articles-first-published) identifies the 16 articles needing dates. Ask for the original publication date and an original source or author confirmation. If only a month/year is known, record that precision rather than inventing a day.

Already confirmed: **Quosay Ahmed, Reem Elmalik and Amr Nasreldin**. Do not reopen those identity decisions.

Remaining approval questions include:

- Whether **Dr. Islam M. Awad** and **Islam M. Awad, PhD** should use one approved credit.
- Whether **Mohamed M. Ahmed** and **Mohamed Mohamedahmed** identify the same author and the preferred credit.
- The approved credit for **Abdelaziz M. A. Ahmed / Abdelaziz Ahmed**.
- Whether **Giovanni Fabbio** remains a co-author on *Driving Climate Action Through Renewable Energy Finance* and *I-RECs*; the recorded archive/live credits disagree.
- Whether **“enerQA’s development team”** is an approved byline for *The Imperative for ESG Readiness Tools*.

Sources: board Part 8, [questionnaire Q15/Q16](questionnaire/STATUS.md#answer-by-answer-status). Publication tags are already authorised and saved; they are not another approval request.

### Additional provider decisions, if these features are in scope

- **SEC corporate disclosures:** ask the editorial owner to approve the companies to follow and what qualifies as relevant environmental, social and governance content. The board records no approval for its default issuer list.
- **ReliefWeb:** confirm the Enerqa email address and person responsible for registration and approval replies. ReliefWeb reviews application-name requests and sends its response by email. Request an [approved ReliefWeb application name](https://apidoc.reliefweb.int/parameters#appname) using that nominated contact. Once approved, the developer sets `RELIEFWEB_APPNAME` in private deployment settings, verifies a successful API response and a complete anonymously accessible report/PDF, then enables the provider. Keep it disabled while approval or access verification is pending. The application name identifies the website integration; the email is the registration contact.
- **GBIF large biodiversity downloads:** arrange an Enerqa-owned download account if the large ZIP-download workflow is required. The existing bounded CSV does not complete that separate workflow.
- **Gapminder:** the supplied developer guide explicitly requires Enerqa to nominate a rights reviewer and record commercial embedding clarification. An older tick in CLIENT_REPLY_PLAN.md is not sufficient evidence that this was obtained.

Sources: [Part 13 remaining actions](PART-13-VERIFICATION.md#remaining-to-dos), [Gapminder developer guide](<reenerqawebsitedeveloperhandoff/Enerqa Data Portal Gapminder Developer Guide Updated.txt>), [OWID/Ember review](questionnaire/DATASET-RIGHTS.md).

Use individual invitations and private deployment settings for credentials. Do not put passwords, API secrets or private permission correspondence into meeting notes or the repository.

## Already answered — do not request again

- Company identity, registered address, privacy contact, policy approver, London/Doha office wording and no phone numbers.
- No individual team cards for this release.
- Domain-to-industry mapping: **7/10/9/8**. Saving/verifying the remaining CMS alignment is a developer task.
- Commentary-only Major Markets panel. A numerical market feed is not required for this release.
- SendPulse as the sending/newsletter service; self-hosted Umami as the analytics choice.
- Two-year enquiry retention and the approved newsletter retention rule; 90-day raw analytics/session retention including backups.
- The four version-2 policy replacements: approved and published on 11 October. Future wording changes for service activation still need review.
- Publication relationships: all **25** article assignments authorised, saved and locally verified on 11 October.
- AI search: deferred; no AI key, new budget decision or AI owner/deputy request for this release.
- Editable sitemap: an SVG has already been prepared. The client can review that artwork; the missing original Word attachment need not trigger another request unless that specific file is required.

## Development and deployment work to report, rather than ask the client to solve

- Verify the deployed release, forms and navigation. PR #29 was merged into main during this session; a merge does not verify the production deployment.
- Local SendPulse credentials and active newsletter list `818733` are verified. SMTP sending is still blocked: the configured sender is active but not allowed for SMTP, and no sending domain is configured. Complete SMTP onboarding, obtain the client-approved production sender and domain DNS access, verify deployment settings, then test delivery, unsubscribe/suppression and retries. Sending remains off; no email was sent during the connection check.
- Apply and verify remaining approved CMS relationships; export current source content and prepare the remaining Arabic translations.
- Verify source terms and downloads, resolve provider errors, confirm schedules and complete the remaining whole-site accessibility checks.
- Complete DOAJ schema/quota verification, Climate TRACE release identification and the OECD finance query. Ask the client for scope/ownership decisions, not database or connector debugging.

## Documentation discrepancies to remember

- HANDOFF-TASKS.md still asks for publication-tag approval near the top and in Part 8/14.5. [STATUS.md Q17](questionnaire/STATUS.md#answer-by-answer-status) and [PUBLICATION-RELATIONSHIPS.md](PUBLICATION-RELATIONSHIPS.md) record completion on 11 October.
- Older board rows still describe policy/schema work and byline spelling persistence as pending. The newer questionnaire and utility evidence record policy publication, six installed fields and nine saved spelling corrections. Remaining disputed identities/co-authors are a separate question.
- CLIENT-QUESTIONS.md is a historical blank questionnaire. Its own update says not to resend answered questions.
- CLIENT_REPLY_PLAN.md contains checked AI access/rollout claims that conflict with the later explicit AI deferral. Do not present AI as launched or approved from those ticks.
- Old database and deployment statements are dated evidence. Do not use them to describe today's production health without a current check.

## Capture commitments before ending the meeting

For each requested item, record **the decision, the named owner, the delivery date, the approver, and whether it is required for the first release**. Also agree the target launch date and the acceptance review date.

| Item | Client decision / scope | Owner | Delivery date | Approver / review date |
|---|---|---|---|---|
| Tool releases and documentation | Pending | Pending | Pending | Pending |
| Publication dates and remaining credits | Pending | Pending | Pending | Pending |
| Accounts and SendPulse delivery setup | Pending | Pending | Pending | Pending |
| ReliefWeb contact email and approved application name | Pending | Pending | Pending | Pending |
| Privacy/record-handling operations | Pending | Pending | Pending | Pending |
| Data permissions and optional providers | Pending | Pending | Pending | Pending |
| Careers text and CV handling | Pending | Pending | Pending | Pending |
| Arabic review and first-page scope | Pending | Pending | Pending | Pending |
| Umami hosting and activation | Pending | Pending | Pending | Pending |

### What to do next:

- Use the nine questions above in the meeting and fill in the commitments table.
- Return the decisions to the developer so the handoff board and implementation can be updated without reopening settled questions.
