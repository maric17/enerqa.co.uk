import '@testing-library/jest-dom'

/**
 * jsdom does not implement IntersectionObserver, but framer-motion's
 * `whileInView` uses it - so every page that renders a <FadeIn> throws
 * "IntersectionObserver is not defined" during a test.
 *
 * This is a minimal stand-in: it satisfies the API surface framer-motion
 * touches without pretending to observe anything. Tests that need to assert on
 * scroll behaviour should drive it explicitly rather than rely on this.
 */
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []
  disconnect(): void {}
  observe(): void {}
  unobserve(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
