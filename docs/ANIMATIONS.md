# Website Animations Guide

We use **Framer Motion** for revealing elements on scroll and **Lenis** for smooth scrolling. This provides a premium, "Framer-like" experience across the site.

## 1. Smooth Scrolling

Smooth scrolling is enabled globally via the `<SmoothScroll>` provider in `src/app/(frontend)/layout.tsx`. You do not need to configure anything for new pages—they will automatically inherit the buttery smooth scroll.

## 2. Scroll Reveals (`FadeIn`)

To make sections or components smoothly slide and fade in as the user scrolls them into view, wrap them in the `<FadeIn>` component.

```tsx
import { FadeIn } from '@/components/animations/FadeIn'

export default function MyPage() {
  return (
    <main>
      <FadeIn>
        <section>This section slides up and fades in!</section>
      </FadeIn>
      
      {/* You can also specify the direction, duration, and delay */}
      <FadeIn direction="left" delay={0.2} duration={1.0}>
        <section>This comes in from the left, a bit slower.</section>
      </FadeIn>
    </main>
  )
}
```

### FadeIn Props
- `direction`: `'up' | 'down' | 'left' | 'right' | 'none'` (default: `'up'`)
- `delay`: Number of seconds to wait before animating (default: `0`)
- `duration`: Animation length in seconds (default: `0.8`)
- `viewAmount`: How much of the element must be in view before it triggers. Can be a number from `0` to `1`, or `'some'` / `'all'` (default: `0.2`).

## 3. Staggered Reveals (`StaggerContainer`)

If you have a list of cards or elements that you want to reveal one by one (like a cascading effect), wrap the parent in `<StaggerContainer>` and the children in `<FadeIn>`.

```tsx
import { StaggerContainer } from '@/components/animations/StaggerContainer'
import { FadeIn } from '@/components/animations/FadeIn'

export default function MyList() {
  return (
    <StaggerContainer staggerDelay={0.15}>
      <div className="grid grid-cols-3 gap-4">
        {/* Each FadeIn child will be delayed by an additional 0.15s */}
        <FadeIn><Card index={1} /></FadeIn>
        <FadeIn><Card index={2} /></FadeIn>
        <FadeIn><Card index={3} /></FadeIn>
      </div>
    </StaggerContainer>
  )
}
```

## 4. Number Counters (`CountUpNumber`)

For statistics that you want to count up dynamically from zero when scrolled into view, use `<CountUpNumber>`.

```tsx
import { CountUpNumber } from '@/components/animations/CountUpNumber'

export default function MyStats() {
  return (
    <div className="stat-number">
      {/* Counts from 0 to 325, adding a "+" suffix */}
      <CountUpNumber value={325} suffix="+" duration={2} delay={0.2} />
    </div>
  )
}
```

### CountUpNumber Props
- `value` (required): The target number to count up to.
- `duration`: How long the animation takes in seconds (default: `2`).
- `delay`: Number of seconds to wait before starting (default: `0`).
- `suffix`: Text to append after the number, e.g., `+` or `%` (default: `''`).
- `prefix`: Text to prepend before the number, e.g., `$` (default: `''`).
- `className`: Optional CSS classes for styling the wrapper.

## Note for Server Components

Framer Motion animations use React hooks (like `useRef` and `useEffect`) and browser APIs (Intersection Observer). Therefore, the animation components (`FadeIn`, `StaggerContainer`, `CountUpNumber`) are marked with `"use client"`. 

However, you can safely pass Server Components as `children` into them! Just wrap your server-rendered sections with `<FadeIn>` inside your pages, exactly as done in `src/app/(frontend)/page.tsx`.
