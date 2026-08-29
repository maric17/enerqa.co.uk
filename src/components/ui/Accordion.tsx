'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
  title: string;
  content: React.ReactNode;
  isOpen?: boolean;
  onClick?: () => void;
}

export function AccordionItem({ title, content, isOpen = false, onClick }: AccordionItemProps) {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        type="button"
        className="w-full py-5 flex items-center justify-between text-left focus:outline-none group"
        onClick={onClick}
      >
        <span className="text-[17px] font-semibold text-gray-900 group-hover:text-[#a0133c] transition-colors">
          {title}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="ml-4 flex-shrink-0 text-gray-400 group-hover:text-[#a0133c] transition-colors"
        >
          <ChevronDown size={20} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-gray-600 text-[15px] leading-relaxed max-w-none">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AccordionProps {
  items: { title: string; content: React.ReactNode }[];
}

export function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.title}
          content={item.content}
          isOpen={openIndex === index}
          onClick={() => setOpenIndex(openIndex === index ? null : index)}
        />
      ))}
    </div>
  );
}
