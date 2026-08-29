import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faXTwitter, faLinkedinIn, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { Container } from './ui/Container';

export function Footer() {
  return (
    <footer className="site bg-[#1b030a] text-white pt-[60px] pb-10 border-t border-white/10 font-sans">
      <Container>
        {/* Top Row: Logo, Sister Brands, Socials */}
        <div className="flex justify-between items-center pb-8 border-b border-white/10 flex-wrap gap-6">
          <div className="flex items-center gap-6 flex-wrap">
            {/* Logo Image */}
            <Link href="/" className="no-underline inline-block">
              <Image src="/images/logo-white.png" alt="enerQA Logo" width={150} height={38} className="h-[38px] w-auto block" />
            </Link>
            {/* Vertical Line */}
            <div className="w-px h-8 bg-white/15 hidden md:inline-block"></div>
            {/* Sister Brands */}
            <div className="flex gap-4 text-[11px] font-bold tracking-[0.05em] uppercase text-white/80 flex-wrap">
              <Link href="/services/climate-change" className="transition-colors duration-200 no-underline text-white/80 hover:text-white">Climate Change</Link>
              <Link href="/services/environment-esg" className="transition-colors duration-200 no-underline text-white/80 hover:text-white">Environment &amp; ESG</Link>
              <Link href="/services/energy" className="transition-colors duration-200 no-underline text-white/80 hover:text-white">Energy</Link>
              <Link href="/services/business-solutions" className="transition-colors duration-200 no-underline text-white/80 hover:text-white">Business Solutions</Link>
            </div>
          </div>
          {/* Socials */}
          <div className="flex gap-2">
            <a href="https://facebook.com/enerqa" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm transition-colors duration-300 text-white no-underline hover:bg-white/20">
              <FontAwesomeIcon icon={faFacebookF} className="w-[14px] h-[14px]" />
            </a>
            <a href="https://x.com/enerqa" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm transition-colors duration-300 text-white no-underline hover:bg-white/20">
              <FontAwesomeIcon icon={faXTwitter} className="w-[14px] h-[14px]" />
            </a>
            <a href="https://linkedin.com/company/enerqa" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm transition-colors duration-300 text-white no-underline hover:bg-white/20">
              <FontAwesomeIcon icon={faLinkedinIn} className="w-[14px] h-[14px]" />
            </a>
            <a href="https://youtube.com/enerqa" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm transition-colors duration-300 text-white no-underline hover:bg-white/20">
              <FontAwesomeIcon icon={faYoutube} className="w-[14px] h-[14px]" />
            </a>
          </div>
        </div>

        {/* Middle Row: Grid Lists */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-10 py-12 border-b border-white/10">
          {/* Col 1 */}
          <div>
            <h6 className="text-white font-bold mb-4 text-[13px] uppercase tracking-wider">Navigation</h6>
            <ul className="flex flex-col gap-3 text-sm list-none p-0 m-0">
              <li><Link href="/" className="text-white/70 hover:text-white transition-colors duration-200 no-underline">Home</Link></li>
              <li><Link href="/services" className="text-white/70 hover:text-white transition-colors duration-200 no-underline">Domains and Industries</Link></li>
              <li><Link href="/knowledge-hub" className="text-white/70 hover:text-white transition-colors duration-200 no-underline">Knowledge Hub</Link></li>
            </ul>
          </div>
          {/* Col 2 */}
          <div>
            <h6 className="text-white font-bold mb-4 text-[13px] uppercase tracking-wider opacity-0 hidden md:block">Navigation Continued</h6>
            <ul className="flex flex-col gap-3 text-sm list-none p-0 m-0">
              <li><Link href="/data-portal" className="text-white/70 hover:text-white transition-colors duration-200 no-underline">Data Portal</Link></li>
              <li><Link href="/tools" className="text-white/70 hover:text-white transition-colors duration-200 no-underline">Tools</Link></li>
              <li><Link href="/about" className="text-white/70 hover:text-white transition-colors duration-200 no-underline">About Us</Link></li>
            </ul>
          </div>
          {/* Col 3 */}
          <div>
            <h6 className="text-white font-bold mb-4 text-[13px] uppercase tracking-wider">Supporting/Utility</h6>
            <ul className="flex flex-col gap-3 text-sm list-none p-0 m-0">
              <li><Link href="/contact" className="text-white/70 hover:text-white transition-colors duration-200 no-underline">Contact</Link></li>
              <li><Link href="/faq" className="text-white/70 hover:text-white transition-colors duration-200 no-underline">FAQ</Link></li>
              <li><Link href="/contact#careers" className="text-white/70 hover:text-white transition-colors duration-200 no-underline">Careers</Link></li>
              <li><Link href="/contact" className="text-white/70 hover:text-white transition-colors duration-200 no-underline">Legal</Link></li>
              <li><Link href="/contact" className="text-white/70 hover:text-white transition-colors duration-200 no-underline">Privacy Notice</Link></li>
            </ul>
          </div>
          {/* Col 4 (Call to Action) */}
          <div className="md:border-l md:border-white/10 md:pl-10 flex flex-col justify-center gap-4">
            <h5 className="text-sm font-bold tracking-[0.05em] uppercase text-white m-0 leading-[1.35] max-w-[24ch]">
              STAY CURRENT WITH OUR LATEST DATA &amp; INSIGHTS
            </h5>
            <Link href="/contact" className="bg-white text-[#1b030a] font-bold rounded-full py-3 px-8 text-[13.5px] border-none w-fit text-center inline-block no-underline hover:bg-gray-100 transition-colors">
              Sign Up
            </Link>
          </div>
        </div>

        {/* Bottom Row: Copyright & Legal */}
        <div className="flex justify-between items-center pt-8 flex-wrap gap-6 text-xs text-white/50">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[#3b0b18] flex items-center justify-center text-white text-sm">
              ♿
            </div>
            <span>© 2026 enerQA Ltd. All Rights Reserved.</span>
          </div>
          <div className="flex gap-4 flex-wrap">
            <Link href="/contact" className="transition-colors duration-200 no-underline text-white/50 hover:text-white">Legal</Link>
            <Link href="/contact" className="transition-colors duration-200 no-underline text-white/50 hover:text-white">Privacy Notice</Link>
            <Link href="/contact" className="transition-colors duration-200 no-underline text-white/50 hover:text-white">Site Accessibility</Link>
            <Link href="/contact" className="transition-colors duration-200 no-underline text-white/50 hover:text-white">Access to Information</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
