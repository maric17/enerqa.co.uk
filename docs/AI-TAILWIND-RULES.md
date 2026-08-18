# AI Tailwind Rules

This document is the **single source of truth** for all Tailwind CSS styling decisions in the EnerQA web app project.

## Core Principles
1. **Semantic Tailwind**: Use reusable semantic classes and shared UI components over repeating utility classes inline.
2. **Consistency First**: Before writing new Tailwind classes, check whether the style or component already exists in the project.
3. **Keep it Clean**: Keep `className` values short and readable. Extract repeated class groups into a reusable React component.
4. **Avoid Excessive Styling**: Only add visual complexity when clearly needed. Prefer consistency with the current design system over creating new styling patterns.

## Design System Tokens
*(To be populated as we migrate the staticSite CSS into Tailwind)*

### Colors
- Primary: TBD
- Secondary: TBD
- Backgrounds: TBD

### Typography
- Headings: TBD
- Body: TBD

## Component Rules
- **Buttons**: Extract common button styles into a `<Button>` component or a centralized Tailwind utility.
- **Layouts**: Prefer standard CSS Grid (`grid-cols-X`) and Flexbox utilities.
