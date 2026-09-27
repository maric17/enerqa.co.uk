import React from 'react';
import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';

interface PageHeroProps {
  title: React.ReactNode;
  breadcrumbs: React.ReactNode;
  imageUrl?: string | null;
}

export function PageHero({ title, breadcrumbs, imageUrl }: PageHeroProps) {
  return (
    <section className="relative w-full h-[65vh] min-h-[500px] flex items-center justify-center bg-[var(--ink)] text-white overflow-hidden py-[100px]">
      {/* Background Image & Overlay */}
      {imageUrl && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        ></div>
      )}
      <div className={`hero-domain-overlay z-10 ${imageUrl ? 'opacity-90' : 'opacity-100'}`}></div>

      <Container className="relative z-20 flex flex-col gap-6 items-start mt-auto md:mt-0 max-md:justify-end max-md:h-full max-md:pb-12 w-full">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] text-white/80 mb-2">
          {breadcrumbs}
        </nav>

        {/* H1 Title */}
        <Typography variant="h1" className="text-white m-0 max-w-[900px]">
          {typeof title === 'string' ? <span className="en block">{title}</span> : title}
        </Typography>
      </Container>
    </section>
  );
}
