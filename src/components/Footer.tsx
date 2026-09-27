import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { Container } from './ui/Container';
import SubscribeForm from './SubscribeForm';
import FooterBreadcrumbs from './FooterBreadcrumbs';
import FooterNavGroup from './FooterNavGroup';
import { getPublishedPolicyLinks } from '@/lib/policies';

// p. 8: "Repeat the six navigation groups with concise links". The groups
// mirror the header; labels are the sitemap names (p. 3). The four domains are
// repeated here rather than imported from Header.tsx: that is a client module,
// and a server component cannot read plain data out of one.
const FOOTER_GROUPS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Homepage',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Search', href: '/search' },
    ],
  },
  {
    title: 'Domains and Industries',
    links: [
      { label: 'Overview', href: '/domains-and-industries' },
      { label: 'Climate Action & Carbon Management', href: '/domains/climate-action-carbon-management' },
      { label: 'Energy Systems & Transition', href: '/domains/energy-systems-transition' },
      { label: 'Environment, Nature & Circularity', href: '/domains/environment-nature-circularity' },
      { label: 'Sustainable Business, ESG & Finance', href: '/domains/sustainable-business-esg-finance' },
      { label: 'Industries', href: '/domains-and-industries#industries' },
      { label: 'Project Development and Lifecycle Support', href: '/project-development' },
    ],
  },
  {
    title: 'Knowledge Hub',
    links: [
      { label: 'Enerqa Publication', href: '/knowledge-hub' },
      { label: 'Global Intelligence', href: '/knowledge-hub/global-intelligence' },
    ],
  },
  {
    title: 'Data Portal',
    links: [
      { label: 'Overview', href: '/data-portal' },
      { label: 'Sources and Methodology', href: '/data-portal/sources' },
    ],
  },
  {
    // The three flagship tools named in the sitemap (p. 3); others only after validation.
    title: 'Tools',
    links: [
      { label: 'All Tools', href: '/tools' },
      { label: 'ESG Readiness Tool', href: '/tools/esg-readiness' },
      { label: 'easySOLAR', href: '/tools/easysolar' },
      { label: 'GreenScale Pro', href: '/tools/greenscale-pro' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'About Enerqa', href: '/about' },
      { label: 'Our Approach', href: '/about#approach' },
      { label: 'People and Organisation', href: '/about#people' },
    ],
  },
];

// min-h-11 gives the contact links a 44px tap target on phones; md drops it so
// the desktop row stays short.
const contactLinkClass = 'inline-flex items-center min-h-11 md:min-h-0 text-white/70 hover:text-white transition-colors duration-200 no-underline';
const policyLinkClass = 'inline-flex items-center min-h-8 md:min-h-0 transition-colors duration-200 no-underline text-white/60 hover:text-white';

export async function Footer() {
  // p. 4: "approved policy pages; no empty or fake links". Only policies whose
  // text is approved in the CMS are linked (p. 208 U02). A database error
  // hides the links instead of breaking the footer on every page.
  const policyLinks = await getPublishedPolicyLinks().catch(() => []);
  const privacyHref = policyLinks.find((link) => link.href === '/privacy')?.href;

  return (
    <footer className="site bg-[#082C45] text-white pt-7 md:pt-10 pb-5 border-t border-white/10 font-sans">
      <Container>
        <FooterBreadcrumbs />

        {/* Top row. Left: logo, then info@enerqa.co.uk, Contact (p. 8) and the
            one social account the current enerqa.co.uk footer links to.
            Facebook, X and YouTube were unverified (p. 227: verified fields
            only). Right: the newsletter as one line, which replaces the old
            separate Contact / Stay Informed band. */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-12 pb-6 border-b border-white/10">
          <div className="flex flex-col gap-3 md:gap-4">
            <Link href="/" className="no-underline inline-block self-start" aria-label="Enerqa home">
              <Image src="/images/logo-white.svg" alt="" width={114} height={30} className="h-[30px] w-auto block" />
            </Link>
            <div className="flex items-center gap-5 text-sm md:text-[13px]">
              <a href="mailto:info@enerqa.co.uk" className={contactLinkClass}>info@enerqa.co.uk</a>
              <Link href="/contact" className={contactLinkClass}>Contact</Link>
              <a
                href="https://www.linkedin.com/company/enerqa"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Enerqa on LinkedIn (opens in a new tab)"
                className="w-11 h-11 md:w-8 md:h-8 rounded-full bg-white/10 flex items-center justify-center transition-colors duration-300 text-white no-underline hover:bg-white/20"
              >
                <FontAwesomeIcon icon={faLinkedinIn} className="w-[14px] h-[14px]" aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full md:max-w-[520px]">
            {/* Heading from the handoff's newsletter blocks (pp. 15, 156). */}
            <h2 className="text-white font-semibold text-sm md:text-[13px] leading-[18px] m-0">Stay Informed</h2>
            <SubscribeForm layout="inline" privacyHref={privacyHref} />
          </div>
        </div>

        {/* Six labelled groups inside one footer landmark. Real h2s, visible,
            with no skipped levels (the old h6/h5 set included an invisible
            "Navigation Continued" heading). Phones: stacked accordions split
            by lines. xl: one row, with the long domain names given the widest
            column so they fit on one line. */}
        <nav
          aria-label="Footer"
          className="grid divide-y divide-white/10 md:divide-y-0 md:grid-cols-3 xl:grid-cols-[0.7fr_1.7fr_1fr_1fr_1fr_1.1fr] md:gap-x-7 md:gap-y-8 md:py-7 border-b border-white/10"
        >
          {FOOTER_GROUPS.map((group) => (
            <FooterNavGroup key={group.title} title={group.title} links={group.links} />
          ))}
        </nav>

        {/* Bottom row: copyright and the approved policy destinations (p. 8). */}
        <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center md:gap-6 pt-4 text-xs text-white/60">
          <div className="flex items-center gap-2.5">
            <div className="w-[22px] h-[22px] rounded-full bg-[#005fcc] flex items-center justify-center text-white text-[11px] shadow-sm" aria-hidden="true">
              ♿
            </div>
            <span className="translate-y-[1px]">© 2026 enerQA Ltd. All Rights Reserved.</span>
          </div>
          {policyLinks.length > 0 && (
            <ul className="flex flex-wrap gap-x-5 list-none p-0 m-0">
              {policyLinks.map((link) => (
                <li key={link.href}><Link href={link.href} className={policyLinkClass}>{link.label}</Link></li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </footer>
  );
}
