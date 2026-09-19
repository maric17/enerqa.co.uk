import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Container } from '../ui/Container'

export const AboutEnerqa = () => {
  return (
    <section className="bg-[var(--color-dark)] py-10 my-[100px] overflow-visible relative z-10" id="about-enerqa">
      <Container className="relative flex items-center justify-between min-h-[260px] overflow-visible">
        
        {/* Left Column (Content) */}
        <div className="relative z-10 flex-[1.4] flex flex-col gap-7 text-left max-w-[52%]">
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--color-primary)] m-0 mb-2">
              About Enerqa
            </h2>
            <p className="text-[clamp(20px,2.6vw,32px)] font-light text-white leading-[1.15] tracking-[-0.02em] m-0 mb-4">
              Connecting priorities with<br/><span className="font-extrabold text-[var(--color-primary)]">practical decisions.</span>
            </p>
            <p className="text-[14.5px] text-white/85 leading-[1.6] m-0 font-light max-w-lg mb-8">
              Enerqa is a multidisciplinary project-development and consultancy company connecting climate, energy, environmental and business priorities with practical decisions and viable initiatives.
            </p>
            <Link href="/about" className="text-[var(--color-primary)] text-[13px] font-bold no-underline border-b-[1.5px] border-[var(--color-primary)] pb-0.5 inline-block transition-opacity hover:opacity-80">
              About Enerqa
            </Link>
          </div>
        </div>

        {/* Right Column (Overlapping Circle) */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-[100]">
          <div className="relative w-[460px] h-[460px] overflow-visible z-[100]">
            {/* Dark arc ring behind the image */}
            <div className="absolute -inset-3 rounded-full bg-[#0a0205]/55 z-0"></div>
            <div className="absolute -inset-6 rounded-full bg-[#0a0205]/25 z-0"></div>
            <Image src="/assets/images/gas-energy.jpg" alt="About enerQA" width={460} height={460} className="w-full h-full object-cover rounded-full relative z-[101] block" />
          </div>
        </div>

      </Container>
    </section>
  )
}

