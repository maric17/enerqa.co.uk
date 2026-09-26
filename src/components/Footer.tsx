import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { Container } from './ui/Container';
import SubscribeForm from './SubscribeForm';
import FooterBreadcrumbs from './FooterBreadcrumbs';

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

const linkClass = 'text-white/70 hover:text-white transition-colors duration-200 no-underline';
const groupTitleClass = 'text-white font-semibold mb-4 text-[15px] leading-snug';

export function Footer() {
  return (
    <footer className="site bg-[#082C45] text-white pt-[60px] pb-10 border-t border-white/10 font-sans">
      <Container>
        <FooterBreadcrumbs />

        {/* Top row: logo and the one social account the current enerqa.co.uk
            footer links to. Facebook, X and YouTube were unverified (p. 227:
            verified fields only) - youtube.com/enerqa is not even a channel URL. */}
        <div className="flex justify-between items-center pb-8 border-b border-white/10 flex-wrap gap-6">
          <Link href="/" className="no-underline inline-block" aria-label="Enerqa home">
            <Image src="/images/logo-white.svg" alt="" width={150} height={38} className="h-[38px] w-auto block" />
          </Link>
          <a
            href="https://www.linkedin.com/company/enerqa"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Enerqa on LinkedIn (opens in a new tab)"
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm transition-colors duration-300 text-white no-underline hover:bg-white/20"
          >
            <FontAwesomeIcon icon={faLinkedinIn} className="w-[14px] h-[14px]" aria-hidden="true" />
          </a>
        </div>

        {/* Six labelled groups inside one footer landmark. Real h2s, visible,
            with no skipped levels (the old h6/h5 set included an invisible
            "Navigation Continued" heading). */}
        <nav aria-label="Footer" className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-x-8 gap-y-10 py-12 border-b border-white/10">
          {FOOTER_GROUPS.map((group, index) => (
            <div key={group.title}>
              <h2 id={`footer-group-${index}`} className={groupTitleClass}>{group.title}</h2>
              <ul aria-labelledby={`footer-group-${index}`} className="flex flex-col gap-3 text-sm list-none p-0 m-0">
                {group.links.map((link) => (
                  <li key={link.href}><Link href={link.href} className={linkClass}>{link.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* p. 8: then info@enerqa.co.uk, Contact and newsletter access. */}
        <div className="grid md:grid-cols-2 gap-10 py-12 border-b border-white/10">
          <div>
            <h2 className={groupTitleClass}>Contact</h2>
            <ul className="flex flex-col gap-3 text-sm list-none p-0 m-0">
              <li><a href="mailto:info@enerqa.co.uk" className={linkClass}>info@enerqa.co.uk</a></li>
              <li><Link href="/contact" className={linkClass}>Contact</Link></li>
            </ul>
          </div>
          <div className="flex flex-col gap-4 max-w-md">
            {/* Heading from the handoff's newsletter blocks (pp. 15, 156). */}
            <h2 className={`${groupTitleClass} m-0`}>Stay Informed</h2>
            <SubscribeForm />
          </div>
        </div>

        {/* Bottom row: copyright, data-source attribution and the four policy
            destinations (p. 8). */}
        <div className="flex justify-between items-center pt-8 flex-wrap gap-6 text-xs text-white/60">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[#005fcc] flex items-center justify-center text-white text-sm shadow-sm" aria-hidden="true">
              ♿
            </div>
            <span>© 2026 enerQA Ltd. All Rights Reserved.</span>
          </div>
          <ul className="flex gap-5 flex-wrap list-none p-0 m-0">
            <li><Link href="/terms" className="transition-colors duration-200 no-underline text-white/60 hover:text-white">Terms of Use</Link></li>
            <li><Link href="/privacy" className="transition-colors duration-200 no-underline text-white/60 hover:text-white">Privacy Notice</Link></li>
            <li><Link href="/cookie-choices" className="transition-colors duration-200 no-underline text-white/60 hover:text-white">Cookie Choices</Link></li>
            <li><Link href="/accessibility" className="transition-colors duration-200 no-underline text-white/60 hover:text-white">Accessibility Statement</Link></li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
