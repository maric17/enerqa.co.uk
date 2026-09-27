/* eslint-disable react-hooks/refs */
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { Container } from './ui/Container';

const SITE_INDEX = [
  { title:'Homepage', url:'/' },
  { title:'Domains and Industries', url:'/domains-and-industries' },
  // p. 6: the lifecycle page sits beside the domains, so it is a quick link too.
  { title:'Project Development and Lifecycle Support', url:'/project-development' },
  { title:'Knowledge Hub', url:'/knowledge-hub' },
  { title:'Data Portal', url:'/data-portal' },
  { title:'Tools', url:'/tools' },
  { title:'About', url:'/about' },
];

// One list feeds the desktop mega menu, the mobile menu and the footer
// breadcrumb, so they can never drift apart. Handoff p. 7: all 4 domains and
// all 13 industries must stay directly reachable, on mobile too.
export const DOMAINS = [
  { title: 'Climate Action & Carbon Management', slug: 'climate-action-carbon-management' },
  { title: 'Energy Systems & Transition', slug: 'energy-systems-transition' },
  { title: 'Environment, Nature & Circularity', slug: 'environment-nature-circularity' },
  { title: 'Sustainable Business, ESG & Finance', slug: 'sustainable-business-esg-finance' },
];

export const INDUSTRIES = [
  { title: 'Government, Regulators & Public Institutions', slug: 'government-regulators-public-institutions' },
  { title: 'Financial Institutions, Investors & Development Finance', slug: 'financial-institutions-investors-development-finance' },
  { title: 'Energy & Utilities', slug: 'energy-utilities' },
  { title: 'Oil, Gas & Petrochemicals', slug: 'oil-gas-petrochemicals' },
  { title: 'Industry, Manufacturing & Materials', slug: 'industry-manufacturing-materials' },
  { title: 'Infrastructure, Real Estate & Industrial Zones', slug: 'infrastructure-real-estate-industrial-zones' },
  { title: 'Transport, Logistics & Mobility', slug: 'transport-logistics-mobility' },
  { title: 'Water, Waste & Circular Economy', slug: 'water-waste-circular-economy' },
  { title: 'Agriculture, Food & Aquaculture', slug: 'agriculture-food-aquaculture' },
  { title: 'Mining & Natural Resources', slug: 'mining-natural-resources' },
  { title: 'Tourism, Hospitality & Destinations', slug: 'tourism-hospitality-destinations' },
  { title: 'Technology, Telecoms & Data Infrastructure', slug: 'technology-telecoms-data-infrastructure' },
  { title: 'Healthcare, Education & Institutional Estates', slug: 'healthcare-education-institutional-estates' },
];

// One link per real About segment (A01-A05, p. 170). The old "Network
// (Partners)" and "Offices & Branches" links pointed at sections that do not
// exist - p. 170 allows addresses only after company approval, and p. 4 rules
// out empty links.
const ABOUT_LINKS = [
  { href: '/about', en: 'About Enerqa', ar: 'عن إنيرقا' },
  { href: '/about#approach', en: 'Our Approach', ar: 'نهجنا' },
  { href: '/about#domains', en: 'Our Domains', ar: 'مجالاتنا' },
  { href: '/about#people', en: 'People and Organisation', ar: 'الأفراد والمؤسسة' },
  { href: '/about#connect', en: 'Connect with Enerqa', ar: 'تواصل مع إنيرقا' },
];

// The desktop menu shows industries in two columns for scanning (p. 7 allows
// visual subgrouping as long as every page stays one click away).
const INDUSTRY_COLUMNS = [INDUSTRIES.slice(0, 7), INDUSTRIES.slice(7)];

type MegaMenuId = 'domains' | 'about';

// How long a hover-opened panel waits before closing once the mouse leaves.
// It lets the pointer cross the gap between the trigger and the panel, which
// used to need a ::before "bridge" that sat on top of the trigger itself.
const HOVER_CLOSE_DELAY_MS = 200;

// Controls a keyboard user can reach, minus the ones inside a closed <details>
// (they have no layout box). Used by both focus traps.
function visibleFocusables(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), summary'),
  ).filter((el) => el.getClientRects().length > 0);
}

// Handoff p. 228: dialog focus trapping. Tab from the last control wraps to the
// first, and Shift+Tab from the first wraps to the last.
function trapFocus(e: React.KeyboardEvent, container: HTMLElement | null) {
  if (e.key !== 'Tab' || !container) return;
  const focusable = visibleFocusables(container);
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

export function Header() {
  const { language, setLanguage, arabicNoticeOpen, dismissArabicNotice } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<MegaMenuId | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHiddenFooter, setIsHiddenFooter] = useState(false);

  // Event handlers read the menu state from refs, not from the render closure.
  // A touch tap fires mouseenter and click in the same tick, before React
  // re-renders, so a closure saw the old value and the tap opened the menu and
  // closed it again at once.
  const activeMegaRef = useRef<MegaMenuId | null>(null);
  // True while a mega menu is open only because the mouse is over it. A click on
  // the trigger then pins it open instead of toggling it shut under the cursor.
  const openedByHover = useRef(false);
  const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRefs = useRef<Partial<Record<MegaMenuId, HTMLButtonElement | null>>>({});

  const mobileNavRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const focusBeforeSearch = useRef<HTMLElement | null>(null);
  const wasSearchOpen = useRef(false);
  const wasMobileNavOpen = useRef(false);

  const cancelHoverClose = useCallback(() => {
    if (hoverCloseTimer.current) {
      clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
  }, []);

  const openMega = useCallback((id: MegaMenuId, byHover: boolean) => {
    cancelHoverClose();
    activeMegaRef.current = id;
    openedByHover.current = byHover;
    setActiveMegaMenu(id);
  }, [cancelHoverClose]);

  const closeMega = useCallback(() => {
    cancelHoverClose();
    activeMegaRef.current = null;
    openedByHover.current = false;
    setActiveMegaMenu(null);
  }, [cancelHoverClose]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 12);

      const footer = document.querySelector('footer.site');
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top;
        const isHidden = footerTop < window.innerHeight + 10 && scrollY > 100;
        setIsHiddenFooter(isHidden);
        if (isHidden) {
          document.body.classList.add('header-hidden');
        } else {
          document.body.classList.remove('header-hidden');
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      // Handoff p. 7: Escape closes the panel.
      if (e.key === 'Escape') {
        const active = activeMegaRef.current;
        if (active) {
          const trigger = triggerRefs.current[active];
          // The panel is about to be hidden, so focus inside it would fall to
          // <body>. Hand it back to the trigger that opened it (p. 228).
          const focusWasInside = trigger?.parentElement?.contains(document.activeElement);
          closeMega();
          if (focusWasInside) trigger?.focus();
        }
        setIsSearchOpen(false);
        setIsMobileNavOpen(false);
        dismissArabicNotice();
      }
    };
    // Handoff p. 7: an outside click closes the panel.
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.nav-item')) closeMega();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [closeMega, dismissArabicNotice]);

  // Close every menu once the visitor lands on a new page. Otherwise the panel
  // stays open over the page they just chose from it.
  useEffect(() => {
    closeMega();
    setIsMobileNavOpen(false);
    dismissArabicNotice();
  }, [pathname, closeMega, dismissArabicNotice]);

  useEffect(() => cancelHoverClose, [cancelHoverClose]);

  useEffect(() => {
    if (isMobileNavOpen) {
      document.documentElement.style.overflow = 'hidden';
      // Move focus into the panel so keyboard and screen-reader users start there.
      mobileNavRef.current?.querySelector<HTMLElement>('.mn-close')?.focus();
    } else {
      document.documentElement.style.overflow = '';
      // Closing (Escape, the close button or a link) hides the panel, so focus
      // inside it would drop to <body>. Return it to the menu button (p. 228).
      if (wasMobileNavOpen.current) menuButtonRef.current?.focus();
    }
    wasMobileNavOpen.current = isMobileNavOpen;
  }, [isMobileNavOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      focusBeforeSearch.current = document.activeElement as HTMLElement | null;
      // An effect, not autoFocus: the input is always mounted, so autoFocus
      // only ever fired on the first page load.
      searchInputRef.current?.focus();
    } else if (wasSearchOpen.current) {
      // Back to whatever opened the dialog - the search button, or the page
      // element that had focus when Ctrl/Cmd+K was pressed.
      const previous = focusBeforeSearch.current;
      if (previous && previous !== document.body && previous.isConnected) previous.focus();
      else searchButtonRef.current?.focus();
    }
    wasSearchOpen.current = isSearchOpen;
  }, [isSearchOpen]);

  // Props shared by every mega-menu nav item: pointer hover, click and keyboard
  // all work (p. 7 - "do not rely on hover alone").
  const megaItemProps = (id: MegaMenuId) => ({
    // Pointer events tell mouse from touch. A tap is left to onClick alone, so
    // it opens the menu on the first tap and closes it on the second.
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      cancelHoverClose();
      if (activeMegaRef.current !== id) openMega(id, true);
    },
    onPointerLeave: (e: React.PointerEvent) => {
      if (e.pointerType !== 'mouse' || !openedByHover.current) return;
      cancelHoverClose();
      hoverCloseTimer.current = setTimeout(closeMega, HOVER_CLOSE_DELAY_MS);
    },
    // Tabbing out of the panel closes it, so a closed-looking menu never keeps
    // focus trapped behind it. A click on empty panel space blurs to nothing
    // (relatedTarget null) - that must not close it.
    onBlur: (e: React.FocusEvent<HTMLDivElement>) => {
      const next = e.relatedTarget as Node | null;
      if (next && !e.currentTarget.contains(next)) closeMega();
    },
  });

  const megaTriggerProps = (id: MegaMenuId) => ({
    type: 'button' as const,
    ref: (el: HTMLButtonElement | null) => { triggerRefs.current[id] = el; },
    onClick: () => {
      if (activeMegaRef.current === id) {
        if (openedByHover.current) {
          // Already open under the mouse: a click pins it rather than closing it.
          openedByHover.current = false;
          return;
        }
        closeMega();
      } else {
        openMega(id, false);
      }
    },
    'aria-expanded': activeMegaMenu === id,
    'aria-controls': `mega-menu-${id}`,
  });

  // A link clicked inside a panel closes it even when only the #hash changes
  // (e.g. /about#people from /about), where the pathname effect never fires.
  const closeOnLinkClick = (close: () => void) => (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a')) close();
  };

  const searchResults = searchQuery.trim()
    ? SITE_INDEX.filter(item => item.title.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : SITE_INDEX;

  // Enter in the header search goes to the full search page instead of doing
  // nothing - the quick links below the input only cover the main sections.
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setIsSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const onLight = isScrolled || pathname !== '/';
  const inDomainsGroup = ['/domains', '/industries', '/project-development'].some((p) => pathname.startsWith(p));
  const navLink = (href: string, en: React.ReactNode, ar?: string) => {
    const isCurrent = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link href={href} className={isCurrent ? 'active' : ''} aria-current={pathname === href ? 'page' : undefined}>
        <span className="en">{en}</span>{ar && <span className="ar">{ar}</span>}
      </Link>
    );
  };

  return (
    <>
      <header className={`site ${onLight ? 'scrolled' : ''} ${isHiddenFooter ? 'hidden-footer' : ''}`}>
        <Container className="header-main">
          <Link href="/" className="logo-zone relative" aria-label="Enerqa home">
            <Image
              src={onLight ? "/images/logo-color.svg" : "/images/logo-white.svg"}
              alt=""
              fill
              className="object-contain object-left transition-opacity duration-300"
              priority
            />
          </Link>
          {/* p. 7: six primary links across the centre, starting with the short
              label Home. */}
          <nav className="primary-nav" aria-label="Main">
            <div className="nav-item">{navLink('/', 'Home')}</div>
            <div className={`nav-item nav-item-static ${activeMegaMenu === 'domains' ? 'mega-open' : ''}`} {...megaItemProps('domains')}>
              <button
                {...megaTriggerProps('domains')}
                className={inDomainsGroup ? 'active' : ''}
              >
                <span className="en">Domains and Industries</span><span className="ar">المجالات والصناعات</span>
              </button>
              <div
                id="mega-menu-domains"
                className="mega mega-redesign"
                data-lenis-prevent
                onClick={closeOnLinkClick(closeMega)}
              >
                <div className="mega-top">
                  <div className="mega-columns">
                    {/* Column titles are labels, not headings: as headings they put
                        three h2/h3s before every page's own h1 (p. 227). */}
                    <div className="mega-col">
                      <p className="mega-col-title" id="mega-domains-label">Domains</p>
                      <ul className="mega-list" aria-labelledby="mega-domains-label">
                        {DOMAINS.map((d) => (
                          <li key={d.slug}><Link href={`/domains/${d.slug}`}>{d.title}</Link></li>
                        ))}
                      </ul>
                    </div>
                    {INDUSTRY_COLUMNS.map((column, idx) => (
                      <div className="mega-col" key={idx}>
                        {/* The second column continues the first, so its title is
                            only a spacer and hidden from screen readers. */}
                        <p
                          className={`mega-col-title ${idx > 0 ? 'invisible' : ''}`}
                          id={idx === 0 ? 'mega-industries-label' : undefined}
                          aria-hidden={idx > 0 ? true : undefined}
                        >
                          Industries
                        </p>
                        <ul className="mega-list" aria-labelledby="mega-industries-label">
                          {column.map((i) => (
                            <li key={i.slug}><Link href={`/industries/${i.slug}`}>{i.title}</Link></li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="mega-featured">
                    <span className="featured-label">Featured</span>
                    <Link href="/knowledge-hub" className="featured-card mb-6">
                      {/* Decorative: the link is named by its text below. */}
                      <Image src="/images/about_practitioners.jpg" alt="" fill sizes="280px" className="object-cover" />
                      <div className="featured-content">
                        {/* A <p>, not a heading: this panel is in the DOM before
                            every page's <h1> (p. 227). Label from p. 174. */}
                        <p>Explore the Knowledge Hub</p>
                      </div>
                    </Link>

                    <div className="mega-featured-links mt-auto pt-4 border-t border-gray-100">
                      <Link href="/project-development" className="block text-[13px] font-bold text-ink mb-2 transition-opacity hover:opacity-80">Project Development and Lifecycle Support</Link>
                      <Link href="/domains-and-industries" className="block text-[13px] font-bold transition-opacity hover:opacity-80" style={{ color: 'var(--color-secondary)' }}>View All Domains and Industries &rarr;</Link>
                    </div>
                  </div>
                </div>

                {/* The old strapline here was not in the handoff, so only the
                    action remains, with the project CTA label used site-wide
                    (pp. 15, 156, 174). */}
                <div className="mega-cta">
                  <Link href="/contact?intent=project" className="btn btn-cta">Discuss Your Project</Link>
                </div>
              </div>
            </div>
            <div className="nav-item">{navLink('/knowledge-hub', 'Knowledge Hub', 'مركز المعرفة')}</div>
            <div className="nav-item">{navLink('/data-portal', 'Data Portal', 'بوابة البيانات')}</div>
            <div className="nav-item">{navLink('/tools', 'Tools', 'الأدوات')}</div>
            <div className={`nav-item ${activeMegaMenu === 'about' ? 'mega-open' : ''}`} {...megaItemProps('about')}>
              <button
                {...megaTriggerProps('about')}
                className={pathname.startsWith('/about') ? 'active' : ''}
              >
                {/* p. 7: keep the primary label "About" consistent. */}
                <span className="en">About</span><span className="ar">من نحن</span>
              </button>
              <div id="mega-menu-about" className="mega" style={{ minWidth: '280px' }} onClick={closeOnLinkClick(closeMega)}>
                <div style={{ width: '100%' }}>
                  <ul>
                    {ABOUT_LINKS.map((l) => (
                      <li key={l.href}><Link href={l.href}><span className="en">{l.en}</span><span className="ar">{l.ar}</span></Link></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </nav>
          <div className="header-actions">
            <div className="langswitch" role="group" aria-label="Language">
              <button type="button" onClick={() => setLanguage('en')} className={language === 'en' ? 'active' : ''} aria-pressed={language === 'en'} aria-label="English">EN</button>
              <button type="button" onClick={() => setLanguage('ar')} className={language === 'ar' ? 'active' : ''} aria-pressed={language === 'ar'} aria-label="Arabic">AR</button>
            </div>
            {/* Always mounted so screen readers announce the text when it
                appears (p. 8: explain availability instead of switching). */}
            <div className="lang-notice-live" role="status">
              {arabicNoticeOpen && (
                <div className="lang-notice">
                  <p>Arabic is not available yet. This page is shown in English.</p>
                  <button type="button" onClick={dismissArabicNotice} aria-label="Dismiss language notice">
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
            <button
              ref={searchButtonRef}
              type="button"
              className="icon-btn flex items-center justify-center text-white/85 bg-transparent text-[15px] rounded-full transition-all duration-200"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
              aria-haspopup="dialog"
              title="Search"
            >
              <Search className="w-[17px] h-[17px]" aria-hidden="true" />
            </button>
            <Link href="/contact" className="btn on-dark header-contact px-5 py-2.5 text-[13px]">
              <span className="en">Contact</span><span className="ar">تواصل</span>
            </Link>
            <button
              ref={menuButtonRef}
              type="button"
              className="icon-btn menu-toggle text-white/85 bg-transparent rounded-full transition-all duration-200"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Menu"
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-nav"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </Container>
      </header>

      {/* inert while closed: the overlay is only faded out, so without it the
          hidden input would still be reachable by Tab. */}
      <div
        className={`search-overlay ${isSearchOpen ? 'open' : ''}`}
        inert={!isSearchOpen}
        data-lenis-prevent
        onClick={(e) => { if (e.target === e.currentTarget) setIsSearchOpen(false); }}
      >
        {/* p. 228: a real modal dialog - named, focus moves in, Tab is trapped
            and Escape returns focus to what opened it. */}
        <div
          ref={searchPanelRef}
          className="search-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Search Enerqa"
          onKeyDown={(e) => trapFocus(e, searchPanelRef.current)}
        >
          <form onSubmit={submitSearch} role="search">
            <span className="flex items-center justify-center" aria-hidden="true">
              <Search className="w-5 h-5 text-[var(--ink-soft)]" />
            </span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search enerQA…"
              aria-label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="button" className="close-search" onClick={() => setIsSearchOpen(false)} aria-label="Esc - close search">ESC</button>
          </form>
          <div className="search-results">
            {searchResults.length === 0 ? (
              <div className="sr-empty">No matches — press Enter to search the whole site.</div>
            ) : (
              searchResults.slice(0, 10).map((item) => (
                <Link key={item.url} href={item.url} onClick={() => setIsSearchOpen(false)}>{item.title}</Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu. Handoff p. 7: "convert the same groups into labelled
          expandable sections rather than removing industry links". <details> is
          the browser's own disclosure widget, so it is keyboard and
          screen-reader accessible with no extra script. inert while closed
          keeps the off-screen links out of the Tab order. */}
      <div
        id="mobile-nav"
        ref={mobileNavRef}
        className={`mobile-nav ${isMobileNavOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!isMobileNavOpen}
        data-lenis-prevent
        onKeyDown={(e) => trapFocus(e, mobileNavRef.current)}
        onClick={closeOnLinkClick(() => setIsMobileNavOpen(false))}
      >
        <div className="mn-top">
          <Link href="/" className="logo-zone relative block w-[140px] h-[34px]" aria-label="Enerqa home">
            <Image src="/images/logo-white.svg" alt="" fill className="object-contain object-left" />
          </Link>
          <button type="button" className="icon-btn mn-close" onClick={() => setIsMobileNavOpen(false)} aria-label="Close menu"><X aria-hidden="true" /></button>
        </div>

        <Link href="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
        <details className="mn-group" open={inDomainsGroup || undefined}>
          <summary>Domains and Industries</summary>
          <div className="mn-sub">
            <Link href="/domains-and-industries">Overview</Link>
            <p className="mn-sub-label">Domains</p>
            {DOMAINS.map((d) => (
              <Link key={d.slug} href={`/domains/${d.slug}`} className={pathname === `/domains/${d.slug}` ? 'active' : ''}>{d.title}</Link>
            ))}
            <p className="mn-sub-label">Industries</p>
            {INDUSTRIES.map((i) => (
              <Link key={i.slug} href={`/industries/${i.slug}`} className={pathname === `/industries/${i.slug}` ? 'active' : ''}>{i.title}</Link>
            ))}
            <p className="mn-sub-label">Method</p>
            <Link href="/project-development" className={pathname === '/project-development' ? 'active' : ''}>Project Development and Lifecycle Support</Link>
          </div>
        </details>
        <Link href="/knowledge-hub" className={pathname.startsWith('/knowledge-hub') ? 'active' : ''}>Knowledge Hub</Link>
        <Link href="/data-portal" className={pathname.startsWith('/data-portal') ? 'active' : ''}>Data Portal</Link>
        <Link href="/tools" className={pathname.startsWith('/tools') ? 'active' : ''}>Tools</Link>
        {/* p. 7 "the same groups": About is a group on desktop, so it is one here. */}
        <details className="mn-group" open={pathname.startsWith('/about') || undefined}>
          <summary>About</summary>
          <div className="mn-sub">
            {ABOUT_LINKS.map((l) => (
              <Link key={l.href} href={l.href}>{l.en}</Link>
            ))}
          </div>
        </details>
        {/* The header's Contact button is hidden on phones to fit the logo, so
            the menu carries it (p. 7 places Contact in the header). */}
        <Link href="/contact" className={`mn-contact ${pathname === '/contact' ? 'active' : ''}`}>Contact</Link>
      </div>
    </>
  );
}
