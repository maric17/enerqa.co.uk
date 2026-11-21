import type { ReactNode } from 'react';
import { Container } from './Container';

export function EnglishPageContent({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="bg-[var(--paper-alt)] pt-28 pb-3 text-sm text-[var(--ink)]">
        <Container>
          <p className="m-0">محتوى هذه الصفحة متاح باللغة الإنجليزية حالياً.</p>
        </Container>
      </div>
      {/* Keep English content readable inside the Arabic site layout. */}
      <div lang="en" dir="ltr" data-english-content>{children}</div>
    </>
  );
}
