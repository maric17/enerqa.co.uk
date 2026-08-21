---
description: Enforces component-based architecture and bans inline CSS in the codebase.
---

# Front-End Styling Architecture Rules

1. **NO INLINE CSS**: Do NOT use `style={{...}}` under any circumstances unless calculating dynamic, mathematical layout positions in JavaScript (e.g., parallax offsets or draggable elements). 
2. **USE TAILWIND**: Rely strictly on Tailwind CSS classes for spacing, layout, typography, and basic styling.
3. **USE UI COMPONENTS**: Do not create raw `<button>`, `<input>`, or basic card `<div>` elements. Always import and use the standardized reusable components from `src/components/ui/` (e.g., `<Button>`, `<Card>`).
4. **CSS VARIABLES**: For brand colors and typography, use the existing CSS variables (e.g., `var(--ink)`, `var(--green)`) inside `style.css` or map them to the Tailwind config.
5. **CENTRALIZED STYLING**: If a component's styles are too complex for Tailwind classes, abstract them into BEM-style classes in `style.css`.
