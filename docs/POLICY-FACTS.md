# Policy pages: facts for the approver

The website has four policy pages: Privacy Notice, Terms of Use, Cookie Choices and Accessibility Statement. The handoff (PDF p. 208) says their text must describe what the site really does, and must be approved before it goes live. This sheet lists what the site does today, taken from the code on 27 Sep 2026. **It is not legal text.** Use it as input when writing or reviewing the four texts.

Items marked **To confirm** are not in the code. Someone at Enerqa has to supply them. The ones only Enerqa can answer are collected, in plain language, in `docs/CLIENT-QUESTIONS.md` (send that to the client).

## How a policy goes live

1. Sign in to `/admin` and open **Policies**. Each of the four pages has one row. All four were approved on 27 Sep 2026; to change a text, edit it and update the approval date.
2. Replace the **Policy Content** with the approved text.
3. Tick **Approved for publication**, then fill in **Approved by** (name and role) and **Approval date**. The page won't save as approved without both.
4. Save. On the next visit the page appears at its address, the footer and sitemap link to it, and (for the Privacy Notice) the contact and newsletter forms link to it too.

Until a row is approved, its page returns "Page Not Found" and nothing links to it.

## The facts

### Company
- The footer reads "© 2026 enerQA Ltd." But the 2026 company profile (`docs/ENERQA profile - 2026_compressed.pdf`) says "Enerqa Consultancy is a Qatari company registered in Qatar", with its address in Doha and offices in London, Doha, Muscat, Riyadh and Beijing. Which entity is responsible for visitors' data decides which data-protection law and regulator the Privacy Notice must name.
- The approved contact address is info@enerqa.co.uk (handoff p. 8). The Privacy and Accessibility pages show it automatically, with a link to the contact form.
- **To confirm:** registered company name, number and address, and who handles data-protection requests.

### Hosting and storage
- The site runs on **Vercel**.
- Uploaded images and files are stored in **Vercel Blob**.
- The content database (pages, publications, form submissions) is **Supabase** (PostgreSQL). One database serves every environment.
- **To confirm:** the data regions for Vercel and Supabase.

### Analytics
- **None.** The site has no analytics, tracking pixels or advertising code.

### AI
- An AI search feature exists but is **switched off**, and no API key is set. If it's switched on, the search terms visitors type would be sent to **OpenAI**. The privacy text must cover this before it's enabled.

### Forms
- **Contact form** (`/contact`) saves: first name, last name, email, company, type of enquiry, message, an optional newsletter tick, and (depending on the enquiry) the tool, domain, industry, project location and project stage.
- **Newsletter sign-up** (in the footer, on the homepage and on the Knowledge Hub) saves the email address and the consent tick. `/newsletter/unsubscribe` withdraws consent.
- Both are stored in the site's database, and only signed-in staff can read them.
- No emails are sent yet. No email service is connected, so there are no confirmation emails and nothing sends the newsletter.
- **To confirm:** how long submissions are kept, the lawful basis for each form, and which service will send the newsletter.

### Cookies and browser storage
On its own, the site stores only:

| Name | Where | What it does | Who gets it |
|---|---|---|---|
| `payload-token` | cookie | Keeps staff signed in to the content editor | Staff only |
| `enerqa-consent` | browser storage | Remembers the visitor's Cookie Choices | Every visitor who saves a choice |
| `enerqa-lang` | browser storage | Remembers the language chosen in the header switch | Visitors who use the switch |
| `enerqa_promotion_cooldown` | browser storage (session) | Part of AI search, which is switched off | Nobody while it's off |

**Embedded third-party content** loads only after the visitor agrees. They can agree for one item ("Load content"), or for all items on the Cookie Choices page, where they can also withdraw. This covers embedded tools, dataset charts and the Gapminder chart. Those sites may set their own cookies; for example, the Gapminder embed also loads Rollbar (an error-reporting service).

The site doesn't load Google Fonts or other outside images in visitors' browsers: fonts and images are served by the site itself.

### Data processors (candidates)
- Vercel (hosting and file storage)
- Supabase (database)
- OpenAI, only if AI search is switched on
- The site's server also fetches public news and research data (for example NewsData, GDELT and OpenAlex). **To confirm:** whether any visitor input, such as search terms, is passed to these services.

### Accessibility
The statement must reflect actual testing (p. 208). So far:
- **Checked:** visible keyboard focus, keyboard focus handling in the search dialog and mobile menu, reduced-motion support.
- **Not yet done:** the full test matrix on handoff p. 228 (laptop and phone widths, slow network, blocked scripts, 125% zoom), an automated accessibility scan, some low-contrast grey text, and data tables for charts. See section 14.3 of `docs/HANDOFF-TASKS.md`.
