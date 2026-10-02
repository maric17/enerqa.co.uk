'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const FALLBACK_IMAGE = '/images/banners/news-thumbnail-fallback.webp';

export function NewsThumbnail({ imageUrl, lead = false, stacked = false }: { imageUrl?: string | null; lead?: boolean; stacked?: boolean }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const sizes = stacked ? '(min-width: 1024px) 360px, (min-width: 640px) 45vw, 100vw' : lead ? '76px' : '64px';

  return (
    <span className={`news-card-thumbnail ${lead ? 'news-card-thumbnail-lead' : ''} ${stacked ? 'news-card-thumbnail-stacked' : ''}`}>
      {/* The headline names the link; this decorative image needs no repeated alt text. */}
      <Image
        src={FALLBACK_IMAGE} alt="" fill sizes={sizes} loading="eager"
        data-news-thumbnail className="object-cover"
      />
      {/* Keep the local fallback underneath; slow or blocked publishers leave no empty box. */}
      {imageUrl && imageUrl !== failedUrl && (
        <Image
          key={imageUrl} src={imageUrl} alt="" fill sizes={sizes} loading="lazy"
          unoptimized referrerPolicy="no-referrer" data-article-thumbnail
          className="object-cover transition-opacity motion-reduce:transition-none"
          style={{ opacity: loadedUrl === imageUrl ? 1 : 0 }}
          onLoad={() => setLoadedUrl(imageUrl)}
          onError={() => setFailedUrl(imageUrl)}
        />
      )}
    </span>
  );
}
