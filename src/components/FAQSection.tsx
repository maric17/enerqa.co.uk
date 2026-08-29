'use client';

import React, { useState, useMemo } from 'react';
import { Typography } from '@/components/ui/Typography';
import { ChevronDown } from 'lucide-react';

type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: string;
  order?: number;
};

export default function FAQSection({ faqs }: { faqs: FAQ[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  // Group FAQs by category
  const groupedFaqs = useMemo(() => {
    const groups: Record<string, FAQ[]> = {};
    faqs.forEach(faq => {
      const cat = faq.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(faq);
    });
    
    // Sort within groups
    Object.keys(groups).forEach(cat => {
      groups[cat].sort((a, b) => (a.order || 999) - (b.order || 999));
    });
    
    return groups;
  }, [faqs]);

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-12">
      {Object.entries(groupedFaqs).map(([category, items]) => (
        <div key={category} className="flex flex-col gap-6">
          <Typography variant="h3" className="text-ink border-b border-ink/10 pb-4 m-0">
            {category}
          </Typography>
          
          <div className="flex flex-col gap-4">
            {items.map(faq => {
              const isOpen = openId === faq.id;
              
              return (
                <div 
                  key={faq.id} 
                  className={`bg-white border rounded-[12px] overflow-hidden transition-all duration-300 ${isOpen ? 'border-ink shadow-md' : 'border-ink/10 hover:border-ink/30'}`}
                >
                  <button 
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-6"
                  >
                    <span className="font-bold text-[16px] md:text-[18px] text-ink pr-4">
                      {faq.question}
                    </span>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${isOpen ? 'bg-ink text-white rotate-180' : 'bg-ink/5 text-ink'}`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </button>
                  
                  <div 
                    className="transition-all duration-300 ease-in-out overflow-hidden"
                    style={{ maxHeight: isOpen ? '1000px' : '0', opacity: isOpen ? 1 : 0 }}
                  >
                    <div className="px-6 pb-6 text-[15px] leading-relaxed text-ink/80 whitespace-pre-wrap">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
