'use client';
import { resolveMediaUrl } from '@/lib/utils';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
          <Link href="/" className="logo-zone">
            <div className="logo-mark">eQ</div>
            <div className="logo-word">enerQA<small><span className="en">Knowledge &amp; Advisory</span><span className="ar">المعرفة والاستشارات</span></small></div>
          </Link>
          <nav className="primary-nav">
            <div className="nav-item">
              <Link href="/" className={pathname === '/' ? 'active' : ''}><span className="en">Home</span><span className="ar">الرئيسية</span></Link>
            </div>
            <div className="nav-item">
              <Link href="/domains-and-industries" className={pathname.startsWith('/domains-and-industries') || pathname.startsWith('/domains') || pathname.startsWith('/industries') ? 'active' : ''}><span className="en">Domains and Industries</span><span className="ar">المجالات والصناعات</span></Link>
              <div className="mega" style={{ minWidth: '800px', display: 'flex', gap: '2rem', padding: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 className="font-bold mb-2">Domains</h3>
                  <ul>
                    <li><Link href="/domains/climate-action-carbon-management"><span className="en">Climate Action &amp; Carbon Management</span><span className="ar">العمل المناخي وإدارة الكربون</span></Link></li>
                    <li><Link href="/domains/energy-systems-transition"><span className="en">Energy Systems &amp; Transition</span><span className="ar">أنظمة الطاقة والتحول</span></Link></li>
                    <li><Link href="/domains/environment-nature-circularity"><span className="en">Environment, Nature &amp; Circularity</span><span className="ar">البيئة والطبيعة والاقتصاد الدائري</span></Link></li>
                    <li><Link href="/domains/sustainable-business-esg-finance"><span className="en">Sustainable Business, ESG &amp; Finance</span><span className="ar">الأعمال المستدامة والحوكمة والتمويل</span></Link></li>
                  </ul>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 className="font-bold mb-2">Industries</h3>
                  <ul>
                    <li><Link href="/industries/government-regulators-public-institutions"><span className="en">Government, Regulators &amp; Public Institutions</span></Link></li>
                    <li><Link href="/industries/financial-institutions-investors-development-finance"><span className="en">Financial Institutions, Investors &amp; Development Finance</span></Link></li>
                    <li><Link href="/industries/energy-utilities"><span className="en">Energy &amp; Utilities</span></Link></li>
                    <li><Link href="/industries/oil-gas-petrochemicals"><span className="en">Oil, Gas &amp; Petrochemicals</span></Link></li>
                    <li><Link href="/industries/industry-manufacturing-materials"><span className="en">Industry, Manufacturing &amp; Materials</span></Link></li>
                    <li><Link href="/industries/infrastructure-real-estate-industrial-zones"><span className="en">Infrastructure, Real Estate &amp; Industrial Zones</span></Link></li>
                    <li><Link href="/industries/transport-logistics-mobility"><span className="en">Transport, Logistics &amp; Mobility</span></Link></li>
                  </ul>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 className="font-bold mb-2">Industries continued</h3>
                  <ul>
                    <li><Link href="/industries/water-waste-circular-economy"><span className="en">Water, Waste &amp; Circular Economy</span></Link></li>
                    <li><Link href="/industries/agriculture-food-aquaculture"><span className="en">Agriculture, Food &amp; Aquaculture</span></Link></li>
                    <li><Link href="/industries/mining-natural-resources"><span className="en">Mining &amp; Natural Resources</span></Link></li>
                    <li><Link href="/industries/tourism-hospitality-destinations"><span className="en">Tourism, Hospitality &amp; Destinations</span></Link></li>
                    <li><Link href="/industries/technology-telecoms-data-infrastructure"><span className="en">Technology, Telecoms &amp; Data Infrastructure</span></Link></li>
                    <li><Link href="/industries/healthcare-education-institutional-estates"><span className="en">Healthcare, Education &amp; Institutional Estates</span></Link></li>
                  </ul>
                </div>
                <div style={{ width: '100%', marginTop: '1rem', borderTop: '1px solid #ccc', paddingTop: '1rem' }}>
                  <Link href="/project-development" className="font-bold block mb-2"><span className="en">Project Development and Lifecycle Support</span></Link>
                  <Link href="/domains-and-industries" className="text-sm"><span className="en">View All Domains and Industries</span></Link>
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
          <div className="logo-word">enerQA</div>
          <button className="icon-btn mn-close" onClick={() => setIsMobileNavOpen(false)} aria-label="Close"><X /></button>
        </div>
        <Link href="/" className={pathname === '/' ? 'active' : ''} onClick={() => setIsMobileNavOpen(false)}>Homepage</Link>
        <Link href="/domains-and-industries" className={pathname.startsWith('/domains-and-industries') ? 'active' : ''} onClick={() => setIsMobileNavOpen(false)}>Domains and Industries</Link>
        <Link href="/knowledge-hub" className={pathname === '/knowledge-hub' ? 'active' : ''} onClick={() => setIsMobileNavOpen(false)}>Knowledge Hub</Link>
        <Link href="/data-portal" className={pathname === '/data-portal' ? 'active' : ''} onClick={() => setIsMobileNavOpen(false)}>Data Portal</Link>
        <Link href="/tools" className={pathname === '/tools' ? 'active' : ''} onClick={() => setIsMobileNavOpen(false)}>Tools</Link>
        <Link href="/about" className={pathname === '/about' ? 'active' : ''} onClick={() => setIsMobileNavOpen(false)}>About</Link>
      </div>
    </>
  );
}
