import React from 'react';
import Link from 'next/link';
import { Typography } from './ui/Typography';

export function Footer() {
  return (
    <footer className="site bg-[#1b030a] text-white pt-[60px] pb-10 border-t border-white/10 font-sans">
      <div className="wrap">
        {/* Top Row: Logo, Sister Brands, Socials */}
        <div className="flex justify-between items-center pb-8 border-b border-white/10 flex-wrap gap-6">
          <div className="flex items-center gap-6 flex-wrap">
            {/* Logo Image */}
            <Link href="/" className="no-underline inline-block">
              <img src="/images/logo-white.png" alt="enerQA Logo" className="h-[38px] w-auto block" />
            </Link>
            {/* Vertical Line */}
            <div className="w-px h-8 bg-white/15 hidden md:inline-block"></div>
            {/* Sister Brands */}
            <div className="flex gap-4 text-[11px] font-bold tracking-[0.05em] uppercase text-white/80 flex-wrap">
              <Link href="/services#climate" className="transition-colors duration-200 no-underline text-white/80 hover:text-white">Climate Change</Link>
              <Link href="/services#environment" className="transition-colors duration-200 no-underline text-white/80 hover:text-white">Environment &amp; ESG</Link>
              <Link href="/services#energy" className="transition-colors duration-200 no-underline text-white/80 hover:text-white">Energy</Link>
              <Link href="/services#business" className="transition-colors duration-200 no-underline text-white/80 hover:text-white">Business Solutions</Link>
            </div>
          </div>
          {/* Socials */}
          <div className="flex gap-2">
            <a href="https://facebook.com/enerqa" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm transition-colors duration-300 text-white no-underline hover:bg-white/20">f</a>
            <a href="https://x.com/enerqa" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm transition-colors duration-300 text-white no-underline hover:bg-white/20">𝕏</a>
            <a href="https://linkedin.com/company/enerqa" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm transition-colors duration-300 text-white no-underline hover:bg-white/20">in</a>
            <a href="https://youtube.com/enerqa" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm transition-colors duration-300 text-white no-underline hover:bg-white/20">yt</a>
          </div>
        </div>

        {/* Middle Row: Grid Lists */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-10 py-12 border-b border-white/10">
          {/* Col 1 */}
          <div>
            <ul className="flex flex-col gap-3 text-sm list-none p-0 m-0">
              <li><Link href="/about" className="text-white/70 hover:text-white transition-colors duration-200 no-underline">Who we are</Link></li>
              <li><Link href="/insights" className="text-white/70 hover:text-white transition-colors duration-200 no-underline">News &amp; Insights</Link></li>
              <li><Link href="/contact#careers" className="text-white/70 hover:text-white transition-colors duration-200 no-underline">Careers</Link></li>
              <li><Link href="/contact" className="text-white/70 hover:text-white transition-colors duration-200 no-underline">Contacts</Link></li>
            </ul>
          </div>
          {/* Col 2 */}
          <div>
            <ul className="flex flex-col gap-3 text-sm list-none p-0 m-0">
              <li><Link href="/services" className="text-white/70 hover:text-white transition-colors duration-200 no-underline">Services Overview</Link></li>
              <li><Link href="/projects" className="text-white/70 hover:text-white transition-colors duration-200 no-underline">Projects &amp; Operations</Link></li>
              <li><Link href="/knowledge-hub" className="text-white/70 hover:text-white transition-colors duration-200 no-underline">Research &amp; Publications</Link></li>
            </ul>
          </div>
          {/* Col 3 */}
          <div>
            <ul className="flex flex-col gap-3 text-sm list-none p-0 m-0">
              <li><Link href="/knowledge-hub#tools" className="text-white/70 hover:text-white transition-colors duration-200 no-underline">Interactive Tools</Link></li>
              <li><Link href="/about#approach" className="text-white/70 hover:text-white transition-colors duration-200 no-underline">Our Approach</Link></li>
              <li><Link href="/team" className="text-white/70 hover:text-white transition-colors duration-200 no-underline">Experts &amp; Team</Link></li>
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
      </div>
    </footer>
  );
}
