import React from 'react';
import Link from 'next/link';
import { ArrowRight, Home, Search } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-[80vh] bg-[var(--color-paper)] pt-[70px] justify-center items-center">
      <Container>
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="text-[12rem] font-bold text-gray-100 leading-none select-none">404</div>
          <h1 className="text-4xl font-bold text-[var(--color-dark)] mb-6 -mt-12 relative z-10">Page Not Found</h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed relative z-10">
            The page or document you are looking for may have been moved, updated or removed.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Link href="/" className="inline-flex justify-center items-center gap-2 bg-[var(--color-dark)] text-white font-bold py-4 px-8 rounded-full hover:bg-gray-800 transition-colors">
              <Home className="w-5 h-5" /> Return to Homepage
            </Link>
            <Link href="/knowledge-hub" className="inline-flex justify-center items-center gap-2 bg-white text-[var(--color-dark)] font-bold py-4 px-8 rounded-full border border-gray-300 hover:border-[var(--color-dark)] transition-colors">
              <Search className="w-5 h-5" /> Search Knowledge Hub
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
