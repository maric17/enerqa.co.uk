'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

export default function SubscribeForm() {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="w-full max-w-[460px] mx-auto flex flex-col sm:flex-row gap-3">
      <input 
        type="email" 
        placeholder="you@organisation.com" 
        className="flex-1 px-5 py-3.5 rounded-full border border-white/10 bg-white/5 text-white placeholder-white/30 outline-none focus:border-white/30 focus:bg-white/10 transition-colors" 
      />
      <Button variant="primary" className="justify-center sm:w-auto h-[52px]">
        <span className="en">Subscribe</span><span className="ar">اشترك</span>
      </Button>
    </form>
  );
}
