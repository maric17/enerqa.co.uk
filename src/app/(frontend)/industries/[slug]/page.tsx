import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Format slug to readable title
  const title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="flex flex-col min-h-[70vh] bg-[var(--color-paper)] pt-[100px] pb-20 justify-center">
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-dark)] mb-6">{title}</h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Detailed information regarding {title} will be available soon. Our team is currently preparing comprehensive insights, data, and methodologies for this industry.
          </p>
          <Link href="/domains-and-industries" className="inline-flex items-center gap-2 bg-[var(--color-secondary)] text-white font-bold py-3 px-8 rounded-full hover:bg-[var(--color-secondary-dark)] transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back to Domains &amp; Industries
          </Link>
        </div>
      </Container>
    </div>
  );
}
