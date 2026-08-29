import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebookF, faXTwitter, faLinkedinIn, faYoutube } from '@fortawesome/free-brands-svg-icons'

export const Footer = () => {
  return (
    <footer className="bg-[#1b030a] text-white py-[60px] pb-[40px] border-t border-white/10 font-sans">
      <div className="w-full max-w-7xl mx-auto px-6">
  
        {/* Top Row: Logo, Sister Brands, Socials */}
        <div className="flex justify-between items-center pb-8 border-b border-white/10 flex-wrap gap-6">
          <div className="flex items-center gap-6 flex-wrap">
            <Link href="/" className="no-underline inline-block">
              <Image src="/images/logo-white.png" alt="enerQA Logo" width={120} height={38} className="block brightness-0 invert" style={{ width: 'auto', height: '38px' }} />
            </Link>
            {/* Vertical Line */}
            <div className="w-[1px] h-8 bg-white/15 inline-block"></div>
            {/* Sister Brands */}
            <div className="flex gap-4 text-[11px] font-bold tracking-[0.05em] uppercase text-white/80 flex-wrap">
              <Link href="#domains" className="transition-colors duration-200 no-underline hover:text-white">Climate Change</Link>
              <Link href="#domains" className="transition-colors duration-200 no-underline hover:text-white">Environment &amp; ESG</Link>
              <Link href="#domains" className="transition-colors duration-200 no-underline hover:text-white">Energy</Link>
              <Link href="/services#business" className="transition-colors duration-200 no-underline hover:text-white">Business Solutions</Link>
            </div>
          </div>
          {/* Socials */}
          <div className="flex gap-2">
            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[14px] transition-colors duration-300 text-white no-underline hover:bg-white/20">
              <FontAwesomeIcon icon={faFacebookF} className="w-[14px] h-[14px]" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[14px] transition-colors duration-300 text-white no-underline hover:bg-white/20">
              <FontAwesomeIcon icon={faXTwitter} className="w-[14px] h-[14px]" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[14px] transition-colors duration-300 text-white no-underline hover:bg-white/20">
              <FontAwesomeIcon icon={faLinkedinIn} className="w-[14px] h-[14px]" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[14px] transition-colors duration-300 text-white no-underline hover:bg-white/20">
              <FontAwesomeIcon icon={faYoutube} className="w-[14px] h-[14px]" />
            </a>
          </div>
        </div>
  
        {/* Middle Row: Grid Lists */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 py-12 border-b border-white/10">
          {/* Col 1 */}
          <div>
            <ul className="flex flex-col gap-3 text-[14px] list-none p-0 m-0">
              <li><Link href="#domains" className="text-white/70 transition-colors duration-200 no-underline hover:text-white">Who we are</Link></li>
              <li><Link href="#insights-teaser" className="text-white/70 transition-colors duration-200 no-underline hover:text-white">News &amp; Insights</Link></li>
              <li><Link href="/contact#careers" className="text-white/70 transition-colors duration-200 no-underline hover:text-white">Careers</Link></li>
              <li><Link href="#cta" className="text-white/70 transition-colors duration-200 no-underline hover:text-white">Contacts</Link></li>
            </ul>
          </div>
          {/* Col 2 */}
          <div>
            <ul className="flex flex-col gap-3 text-[14px] list-none p-0 m-0">
              <li><Link href="#domains" className="text-white/70 transition-colors duration-200 no-underline hover:text-white">Services Overview</Link></li>
              <li><Link href="#featured-work" className="text-white/70 transition-colors duration-200 no-underline hover:text-white">Projects &amp; Operations</Link></li>
              <li><Link href="/knowledge-hub" className="text-white/70 transition-colors duration-200 no-underline hover:text-white">Research &amp; Publications</Link></li>
            </ul>
          </div>
          {/* Col 3 */}
          <div>
            <ul className="flex flex-col gap-3 text-[14px] list-none p-0 m-0">
              <li><Link href="/knowledge-hub#tools" className="text-white/70 transition-colors duration-200 no-underline hover:text-white">Interactive Tools</Link></li>
              <li><Link href="/about#approach" className="text-white/70 transition-colors duration-200 no-underline hover:text-white">Our Approach</Link></li>
              <li><Link href="/team" className="text-white/70 transition-colors duration-200 no-underline hover:text-white">Experts &amp; Team</Link></li>
            </ul>
          </div>
          {/* Col 4 (Call to Action) */}
          <div className="lg:border-l lg:border-white/10 lg:pl-10 flex flex-col justify-center gap-4">
            <h5 className="text-[14px] font-bold tracking-[0.05em] uppercase text-white m-0 leading-[1.35] max-w-[24ch]">
              STAY CURRENT WITH OUR LATEST DATA &amp; INSIGHTS
            </h5>
            <Link href="#cta" className="bg-white text-[#0f2841] font-bold rounded-full py-3 px-8 text-[13.5px] w-fit text-center inline-block no-underline hover:bg-gray-200 transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
  
        {/* Bottom Row: Copyright & Legal */}
        <div className="flex justify-between items-center pt-8 flex-wrap gap-6 text-[12px] text-white/50">
          <div className="flex items-center gap-3">
            <span>&copy; 2026 enerQA Ltd. All Rights Reserved.</span>
          </div>
          <div className="flex gap-4 flex-wrap">
            <Link href="#" className="transition-colors duration-200 no-underline text-white/50 hover:text-white">Legal</Link>
            <Link href="#" className="transition-colors duration-200 no-underline text-white/50 hover:text-white">Privacy Notice</Link>
            <Link href="#" className="transition-colors duration-200 no-underline text-white/50 hover:text-white">Site Accessibility</Link>
            <Link href="#" className="transition-colors duration-200 no-underline text-white/50 hover:text-white">Access to Information</Link>
          </div>
        </div>
  
      </div>
    </footer>
  )
}
