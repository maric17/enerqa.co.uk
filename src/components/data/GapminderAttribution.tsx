import { GAPMINDER_LICENCE_URL } from '@/lib/data-portal/attribution';

/** Use Gapminder's exact citations; the custom chart adapts its data presentation. */
export function GapminderAttribution({ original = false }: { original?: boolean }) {
  return <p data-gapminder-attribution>
    {original ? <>FREE TO USE! <a href={GAPMINDER_LICENCE_URL} className="underline" title="Creative Commons Attribution 4.0 International">CC-BY</a> <a href="https://www.gapminder.org" className="underline">GAPMINDER.ORG</a></> :
      <>Based on free material from <a href="https://www.gapminder.org/data/" className="underline">GAPMINDER.ORG</a>, <a href={GAPMINDER_LICENCE_URL} className="underline" title="Creative Commons Attribution 4.0 International">CC-BY LICENSE</a></>}
  </p>;
}
