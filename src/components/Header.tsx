'use client';
import { resolveMediaUrl } from '@/lib/utils';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { Container } from './ui/Container';

const SITE_INDEX = [
  { title:'Homepage', url:'/' },
  { title:'Domains and Industries', url:'/domains-and-industries' },
  { title:'Knowledge Hub', url:'/knowledge-hub' },
  { title:'Data Portal', url:'/data-portal' },
  { title:'Tools', url:'/tools' },
  { title:'About', url:'/about' },
];

export function Header() {
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHiddenFooter, setIsHiddenFooter] = useState(false);

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
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMobileNavOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isMobileNavOpen) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
    }
  }, [isMobileNavOpen]);

  const searchResults = searchQuery.trim() 
    ? SITE_INDEX.filter(item => item.title.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : SITE_INDEX;

  return (
    <>
      <header className={`site ${isScrolled || pathname !== '/' ? 'scrolled' : ''} ${isHiddenFooter ? 'hidden-footer' : ''}`}>
        <Container className="header-main !px-6 md:!px-10">
          <Link href="/" className="logo-zone relative">
            <Image 
              src={isScrolled || pathname !== '/' ? "/images/logo-color.svg" : "/images/logo-white.svg"} 
              alt="enerQA Logo" 
              fill 
              className="object-contain object-left transition-opacity duration-300"
              priority
            />
          </Link>
          <nav className="primary-nav">

            <div className="nav-item nav-item-static">
              <Link href="/domains-and-industries" className={pathname.startsWith('/domains-and-industries') || pathname.startsWith('/domains') || pathname.startsWith('/industries') ? 'active' : ''}><span className="en">Domains and Industries</span><span className="ar">المجالات والصناعات</span></Link>
              <div className="mega mega-redesign">
                <div className="mega-top">
                  <div className="mega-columns">
                    {/* Col 1 */}
                    <div className="mega-col">
                      <h3 className="mega-col-title">Domains</h3>
                      <ul className="mega-list">
                        <li><Link href="/domains/climate-action-carbon-management">Climate Action &amp; Carbon Management</Link></li>
                        <li><Link href="/domains/energy-systems-transition">Energy Systems &amp; Transition</Link></li>
                        <li><Link href="/domains/environment-nature-circularity">Environment, Nature &amp; Circularity</Link></li>
                        <li><Link href="/domains/sustainable-business-esg-finance">Sustainable Business, ESG &amp; Finance</Link></li>
                      </ul>
                    </div>
                    {/* Col 2 */}
                    <div className="mega-col">
                      <h3 className="mega-col-title">Industries</h3>
                      <ul className="mega-list">
                        <li><Link href="/industries/government-regulators-public-institutions">Government, Regulators &amp; Public Institutions</Link></li>
                        <li><Link href="/industries/financial-institutions-investors-development-finance">Financial Institutions, Investors &amp; Development Finance</Link></li>
                        <li><Link href="/industries/energy-utilities">Energy &amp; Utilities</Link></li>
                        <li><Link href="/industries/oil-gas-petrochemicals">Oil, Gas &amp; Petrochemicals</Link></li>
                        <li><Link href="/industries/industry-manufacturing-materials">Industry, Manufacturing &amp; Materials</Link></li>
                        <li><Link href="/industries/infrastructure-real-estate-industrial-zones">Infrastructure, Real Estate &amp; Industrial Zones</Link></li>
                        <li><Link href="/industries/transport-logistics-mobility">Transport, Logistics &amp; Mobility</Link></li>
                      </ul>
                    </div>
                    {/* Col 3 */}
                    <div className="mega-col">
                      <h3 className="mega-col-title invisible">Industries</h3>
                      <ul className="mega-list">
                        <li><Link href="/industries/water-waste-circular-economy">Water, Waste &amp; Circular Economy</Link></li>
                        <li><Link href="/industries/agriculture-food-aquaculture">Agriculture, Food &amp; Aquaculture</Link></li>
                        <li><Link href="/industries/mining-natural-resources">Mining &amp; Natural Resources</Link></li>
                        <li><Link href="/industries/tourism-hospitality-destinations">Tourism, Hospitality &amp; Destinations</Link></li>
                        <li><Link href="/industries/technology-telecoms-data-infrastructure">Technology, Telecoms &amp; Data Infrastructure</Link></li>
                        <li><Link href="/industries/healthcare-education-institutional-estates">Healthcare, Education &amp; Institutional Estates</Link></li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mega-featured">
                    <span className="featured-label">Featured</span>
                    <Link href="/knowledge-hub" className="featured-card mb-6">
                      <Image src="/images/about_practitioners.jpg" alt="Featured Team" fill className="object-cover" />
                      <div className="featured-content">
                        <h5>Explore our Knowledge &amp; Advisory Hub</h5>
                      </div>
                    </Link>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <Link href="/project-development" className="block text-[13px] font-bold text-ink mb-2 transition-opacity hover:opacity-80">Project Development and Lifecycle Support</Link>
                      <Link href="/domains-and-industries" className="block text-[13px] font-bold transition-opacity hover:opacity-80" style={{ color: 'var(--color-secondary)' }}>View All Domains and Industries &rarr;</Link>
                    </div>
                  </div>
                </div>

                <div className="mega-cta">
                  <p>Every business starts somewhere different. Tell us where you're starting from.</p>
                  <Link href="/contact" className="btn btn-cta">Contact Us</Link>
                </div>
              </div>
            </div>
            <div className="nav-item"><Link href="/knowledge-hub" className={pathname === '/knowledge-hub' ? 'active' : ''}><span className="en">Knowledge Hub</span><span className="ar">مركز المعرفة</span></Link></div>
            <div className="nav-item"><Link href="/data-portal" className={pathname === '/data-portal' ? 'active' : ''}><span className="en">Data Portal</span><span className="ar">بوابة البيانات</span></Link></div>
            <div className="nav-item"><Link href="/tools" className={pathname === '/tools' ? 'active' : ''}><span className="en">Tools</span><span className="ar">الأدوات</span></Link></div>
            <div className="nav-item">
              <Link href="/about" className={pathname === '/about' ? 'active' : ''}><span className="en">About Us</span><span className="ar">من نحن</span></Link>
              <div className="mega" style={{ minWidth: '280px' }}>
                <div style={{ width: '100%' }}>
                  <ul>
                    <li><Link href="/about#overview"><span className="en">Company Overview / Mission</span><span className="ar">نظرة عامة / مهمتنا</span></Link></li>
                    <li><Link href="/about#approach"><span className="en">Approach / Methodology</span><span className="ar">النهج / المنهجية</span></Link></li>
                    <li><Link href="/about#network"><span className="en">Enerqa's Network (Partners)</span><span className="ar">شبكة شركاء إنيرقا</span></Link></li>
                    <li><Link href="/about#offices"><span className="en">Offices &amp; Branches</span><span className="ar">المكاتب والفروع</span></Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </nav>
          <div className="header-actions">
            <div className="langswitch">
              <button onClick={() => setLanguage('en')} className={language === 'en' ? 'active' : ''}>EN</button>
              <button onClick={() => setLanguage('ar')} className={language === 'ar' ? 'active' : ''}>AR</button>
            </div>
            <button className="icon-btn flex items-center justify-center text-white/85 bg-transparent text-[15px] rounded-full transition-all duration-200" onClick={() => setIsSearchOpen(true)} aria-label="Search" title="Search">
              <Search className="w-[17px] h-[17px]" />
            </button>
            <Link href="/contact" className="btn on-dark px-5 py-2.5 text-[13px]">
              <span className="en">Contact</span><span className="ar">تواصل</span>
            </Link>
            <button className="icon-btn menu-toggle text-white/85 bg-transparent rounded-full transition-all duration-200" onClick={() => setIsMobileNavOpen(true)} aria-label="Menu">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </Container>
      </header>

      <div className={`search-overlay ${isSearchOpen ? 'open' : ''}`} onClick={(e) => { if(e.target === e.currentTarget) setIsSearchOpen(false); }}>
        <div className="search-panel">
          <form onSubmit={(e) => e.preventDefault()}>
            <span className="flex items-center justify-center">
              <Search className="w-5 h-5 text-[var(--ink-soft)]" />
            </span>
            <input type="text" placeholder="Search enerQA…" aria-label="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus={isSearchOpen} />
            <button type="button" className="close-search" onClick={() => setIsSearchOpen(false)}>ESC</button>
          </form>
          <div className="search-results">
            {searchResults.length === 0 ? (
              <div className="sr-empty">No matches — try a different term.</div>
            ) : (
              searchResults.slice(0, 10).map((item) => (
                <Link key={item.url} href={item.url} onClick={() => setIsSearchOpen(false)}>{item.title}</Link>
              ))
            )}
          </div>
        </div>
      </div>

      <div className={`mobile-nav ${isMobileNavOpen ? 'open' : ''}`}>
        <div className="mn-top">
          <Link href="/" className="logo-zone relative block w-[140px] h-[34px]" onClick={() => setIsMobileNavOpen(false)}>
            <Image src="/images/logo-white.svg" alt="enerQA Logo" fill className="object-contain object-left" priority />
          </Link>
          <button className="icon-btn mn-close" onClick={() => setIsMobileNavOpen(false)} aria-label="Close"><X /></button>
        </div>

        <Link href="/domains-and-industries" className={pathname.startsWith('/domains-and-industries') ? 'active' : ''} onClick={() => setIsMobileNavOpen(false)}>Domains and Industries</Link>
        <Link href="/knowledge-hub" className={pathname === '/knowledge-hub' ? 'active' : ''} onClick={() => setIsMobileNavOpen(false)}>Knowledge Hub</Link>
        <Link href="/data-portal" className={pathname === '/data-portal' ? 'active' : ''} onClick={() => setIsMobileNavOpen(false)}>Data Portal</Link>
        <Link href="/tools" className={pathname === '/tools' ? 'active' : ''} onClick={() => setIsMobileNavOpen(false)}>Tools</Link>
        <Link href="/about" className={pathname === '/about' ? 'active' : ''} onClick={() => setIsMobileNavOpen(false)}>About</Link>
      </div>
    </>
  );
}
