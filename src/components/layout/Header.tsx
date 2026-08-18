import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export const Header = () => {
  return (
    <header className="fixed top-5 left-1/2 -translate-x-1/2 w-[calc(100%-80px)] max-w-7xl z-[100] bg-[rgba(139,21,56,0.15)] backdrop-blur-[20px] border border-white/20 rounded-[14px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] p-3 px-4">
      <div className="flex items-center justify-between h-[34px]">
        
        {/* Logo Zone */}
        <Link href="/" className="block relative w-[140px] h-[34px]">
          <Image src="/images/logo-white.png" alt="enerQA" fill className="object-contain object-left" />
        </Link>

        {/* Primary Navigation */}
        <nav className="hidden lg:flex items-center space-x-2 absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="px-4 py-2 text-[14px] font-bold text-white relative after:content-[''] after:absolute after:bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-[2px] after:bg-white after:rounded-sm">
            <span className="en">Home</span>
          </Link>
          <Link href="/#domains" className="px-4 py-2 text-[14px] font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors">
            <span className="en">Domains &amp; Services</span>
          </Link>
          <Link href="/#featured-work" className="px-4 py-2 text-[14px] font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors">
            <span className="en">Projects</span>
          </Link>
          <Link href="/knowledge-hub" className="px-4 py-2 text-[14px] font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors">
            <span className="en">Knowledge Hub</span>
          </Link>
          <Link href="/#domains" className="px-4 py-2 text-[14px] font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors">
            <span className="en">About</span>
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-[13px] font-bold text-white/80 mr-2">
            <button className="text-white hover:text-white transition-colors px-1">EN</button>
            <button className="hover:text-white transition-colors px-1">AR</button>
          </div>
          
          <div className="hidden sm:block w-px h-5 bg-white/20"></div>
          
          <button aria-label="Search" className="w-8 h-8 text-white/85 hover:text-white flex items-center justify-center transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
          
          <div className="hidden sm:block w-px h-5 bg-white/20"></div>
          
          <Link href="/#cta" className="hidden sm:inline-flex bg-white text-[#0c0c0c] hover:bg-gray-100 hover:-translate-y-[1px] px-5 py-1.5 rounded-full text-[12px] font-bold shadow-[0_4px_15px_rgba(0,0,0,0.1)] transition-all">
            <span className="en">Contact</span>
          </Link>
          
          <button aria-label="Menu" className="lg:hidden p-2 text-white/85 hover:text-white rounded-full transition-colors flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </div>
        
      </div>
    </header>
  )
}
