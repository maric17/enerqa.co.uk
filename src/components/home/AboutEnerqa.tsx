import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Container } from '../ui/Container'

export const AboutEnerqa = () => {
  return (
    <section className="relative bg-[var(--color-dark)] py-16 lg:py-20" id="about-enerqa">
      <Container className="grid items-center gap-12 md:grid-cols-[1.4fr_1fr]">
        
        {/* Left Column (Content) */}
        <div className="flex flex-col gap-7 text-left">
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

        {/* Reuse the original vector planet so it stays sharp at the larger size. */}
        <div className="flex min-h-[160px] items-center justify-center border-t border-white/15 pt-10 md:min-h-[260px] md:border-l md:border-t-0 md:pl-10 md:pt-0">
          <Image src="/images/enerqa-planet-symbol.svg" alt="Enerqa planet symbol" width={280} height={280} className="h-auto w-[220px] max-w-full md:w-[280px]" />
        </div>
      </Container>
    </section>
  )
}

