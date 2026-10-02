'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { PublicationImage } from './publicationImage';

export function PublicationCover({ image, thumbnail = false, featured = false }: {
  image: PublicationImage | null;
  thumbnail?: boolean;
  featured?: boolean;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* One decorative cover stays underneath, including when an upload fails. */}
      <div
        aria-hidden="true"
        data-publication-cover
        className="absolute inset-0 bg-[#082c45]"
        style={{ backgroundImage: 'radial-gradient(ellipse at 85% 20%, #18566a 0%, transparent 60%), linear-gradient(135deg, #082c45, #061b2b)' }}
      >
        <svg className="absolute right-[-15%] top-[-35%] h-[150%] w-[90%] text-white/10" viewBox="0 0 800 800" fill="none">
          {[160, 230, 300, 370].map((radius) => <circle key={radius} cx="400" cy="400" r={radius} stroke="currentColor" />)}
          <path d="M0 400h800M400 0v800M117 117l566 566M117 683l566-566" stroke="currentColor" />
        </svg>
        <span className={`absolute border-t border-white/30 pt-3 font-bold uppercase tracking-[0.2em] text-white/60 ${thumbnail ? 'right-4 top-4 text-[9px]' : 'right-6 top-28 text-[10px] md:right-12'}`}>Enerqa Publication</span>
      </div>
      {image && image.src !== failedSrc && (
        <Image
          key={image.src}
          src={image.src}
          alt={image.alt}
          fill
          sizes={thumbnail ? `(min-width: 640px) ${featured ? '240px' : '192px'}, 100vw` : '100vw'}
          loading={thumbnail ? 'lazy' : 'eager'}
          className="object-cover"
          onError={() => setFailedSrc(image.src)}
        />
      )}
      {/* A dark overlay keeps the title readable without tinting photos green. */}
      {!thumbnail && <div className="absolute inset-0 bg-gradient-to-t from-[#061b2b]/95 via-[#061b2b]/50 to-[#061b2b]/20" aria-hidden="true" />}
    </div>
  );
}
