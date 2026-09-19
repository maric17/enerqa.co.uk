# Content Details Design (Part 12.1 & 12.5)

## Overview
This document specifies the design for aligning the Publication detail (`/knowledge-hub/[slug]`) and Tool detail (`/tools/[slug]`) routes with the handoff specifications. It includes updates to the Payload CMS schema to support tool fields and an inline form for access requests.

## 1. Publication Detail (12.1)

### CMS Collections
- **Publications**: No schema changes required. All necessary fields (`title`, `type`, `date`, `dateVerified`, `author`) are already present in the CMS.

### Frontend Route (`/knowledge-hub/[slug]/page.tsx`)
- **PUBL01 Header**: The hero section will be updated to display:
  - `title`
  - `type`
  - `date`: If `dateVerified` is `false`, the text `(date unverified)` will be appended to the rendered date.
  - `author`: Added to the meta information bar.
  - A button to download the PDF (`file`).
- **Body Content**: Continue to render the `content` via Payload's `RichText` component. No structural changes needed.

## 2. Tool Detail (12.5)

### CMS Collections
#### Tools
The `Tools` collection will be extended with the following fields:
- `purpose` (RichText): TD01 Overview content.
- `inputs` (RichText): TD02 Inputs specification.
- `outputs` (RichText): TD02 Outputs specification.
- `method` (RichText): TD03 Methodology and limits.
- `version` (Text): Semantic version or version string.
- `access` (Select): Options - `Request Access` (default), `Public`, `Enterprise`.
- `privacy` (RichText): Privacy notices regarding tool usage.

#### Enquiries (New Collection)
A new collection will be created to store "Request Access" form submissions.
- `name` (Text, required)
- `email` (Text, required)
- `company` (Text, required)
- `message` (Textarea)
- `toolRequested` (Relationship to `tools`)
- `source` (Text, defaultValue: 'Tool Request')

*Note: This collection will be added to the Payload configuration (`payload.config.ts`).*

### Frontend Route (`/tools/[slug]/page.tsx`)
The page will be rebuilt to accommodate the TD01-TD05 sections:

- **TD01 Tool Overview**: Renders Title, `version`, and the `purpose` rich text.
- **TD02 Inputs & Outputs**: Renders the `inputs` and `outputs` side-by-side or stacked.
- **TD03 Methodology & Limits**: Renders the `method` field.
- **TD04 Access the Tool**:
  - If `access` is set to `Request Access`: Renders an inline React hook form. The form will capture Name, Email, Company, and an optional message. It will submit to a Next.js Server Action, which writes the payload into the `Enquiries` CMS collection and returns a success/error state. The user remains on the page.
  - If `access` is `Public`, the form is hidden and the tool link/iframe is shown.
- **TD05 Guidance and Support**: A static CTA section directing users to the `info@enerqa.co.uk` email for support.

## Ambiguity and Constraints
- The `Enquiries` collection is built specifically to fulfill TD04, but is intentionally generalized so it can handle the site-wide contact form (12.7) in subsequent work.
- We assume all new RichText fields will utilize the existing `standardEditor` configuration.
