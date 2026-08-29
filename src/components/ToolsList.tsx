'use client';

import React, { useState } from 'react';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Image from 'next/image';

type Tool = {
  id: string;
  category: string;
  title: string;
  desc: string;
  image?: { url?: string, alt?: string } | string;
  link?: string;
  slug: string;
  type: 'interactive' | 'informational';
};

export default function ToolsList({ tools }: { tools: Tool[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  // Find unique categories
  const allCategories = Array.from(new Set(tools.map(t => t.category))).filter(Boolean);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (e.target.checked) {
      setCategories([...categories, value]);
    } else {
      setCategories(categories.filter(c => c !== value));
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (e.target.checked) {
      setTypes([...types, value]);
    } else {
      setTypes(types.filter(c => c !== value));
    }
  };

  const filteredTools = tools.filter(tool => {
    const searchable = `${tool.title} ${tool.desc} ${tool.category}`.toLowerCase();
    const matchSearch = searchable.includes(searchQuery.toLowerCase());
    const matchCategory = categories.length === 0 || categories.includes(tool.category);
    const matchType = types.length === 0 || types.includes(tool.type);
    return matchSearch && matchCategory && matchType;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12 mt-4">
      <aside className="flex flex-col gap-8 h-fit bg-[#FAFBFB] p-6 rounded-[16px] border border-ink/10 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
        <Typography variant="h3" className="text-ink m-0">
          <span className="en block">Refine results</span>
          <span className="ar block mt-1">تصفية النتائج</span>
        </Typography>
        
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink">
            <span className="en">Keyword</span><span className="ar ml-2">كلمة مفتاحية</span>
          </label>
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Search tools…" 
            className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[14px] text-ink outline-none focus:border-ink/30 transition-colors"
          />
        </div>
        
        <div className="flex flex-col gap-3 mt-4">
          <label className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink">
            <span className="en">Type</span><span className="ar ml-2">النوع</span>
          </label>
          <div className="flex flex-col gap-2">
            {[
              { id: 'interactive', en: 'Interactive Tools', ar: 'أدوات تفاعلية' },
              { id: 'informational', en: 'Guides & Toolkits', ar: 'أدلة وأدوات' }
            ].map(typeObj => (
              <label key={typeObj.id} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  value={typeObj.id} 
                  checked={types.includes(typeObj.id)} 
                  onChange={handleTypeChange} 
                  className="w-4 h-4 accent-ink"
                />
                <span className="text-[14px] text-ink group-hover:text-ink-soft transition-colors">
                  <span className="en">{typeObj.en}</span><span className="ar hidden group-[[data-lang=ar]]:inline-block">{typeObj.ar}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {allCategories.length > 0 && (
          <div className="flex flex-col gap-3">
            <label className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink">
              <span className="en">Category</span><span className="ar ml-2">الفئة</span>
            </label>
            <div className="flex flex-col gap-2">
              {allCategories.map(cat => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    value={cat} 
                    checked={categories.includes(cat)} 
                    onChange={handleCategoryChange} 
                    className="w-4 h-4 accent-ink"
                  />
                  <span className="text-[14px] text-ink group-hover:text-ink-soft transition-colors">
                    <span className="en">{cat}</span><span className="ar hidden group-[[data-lang=ar]]:inline-block">{cat}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        <Button 
          variant="outline" 
          onClick={() => { setSearchQuery(''); setCategories([]); setTypes([]); }}
          className="w-full justify-center"
        >
          <span className="en">Clear filters</span><span className="ar ml-2">مسح عوامل التصفية</span>
        </Button>
      </aside>

      <div className="flex flex-col gap-8">
        {filteredTools.length === 0 ? (
          <div className="py-10 text-center text-ink-soft bg-[#FAFBFB] rounded-[16px] border border-ink/10">
            <span className="en block">No tools match your filters.</span>
            <span className="ar block mt-2">لا توجد أدوات مطابقة لعوامل التصفية.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTools.map((tool) => (
              <div key={tool.id} className="flex flex-col gap-4 p-6 rounded-[16px] border border-ink/10 hover:border-ink/30 transition-colors bg-white shadow-sm hover:shadow-md h-full">
                {tool.image && typeof tool.image !== 'string' && tool.image.url && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-ink/5 mb-2">
                    <Image src={tool.image.url} alt={tool.image.alt || tool.title} fill className="object-cover" />
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Badge variant="solid" className={tool.type === 'interactive' ? 'bg-[#A8192E] text-white' : 'bg-ink text-white'}>
                    <span className="en">{tool.type === 'interactive' ? 'Interactive Tool' : 'Informational Guide'}</span>
                    <span className="ar hidden group-[[data-lang=ar]]:inline-block">{tool.type === 'interactive' ? 'أداة تفاعلية' : 'دليل إعلامي'}</span>
                  </Badge>
                  <Badge variant="outline">
                    <span className="en">{tool.category}</span><span className="ar">{tool.category}</span>
                  </Badge>
                </div>
                <Typography variant="h3" className="text-ink m-0">
                  <span className="en block">{tool.title}</span><span className="ar block mt-1">{tool.title}</span>
                </Typography>
                <p className="text-[14px] text-ink-soft mt-1 flex-grow">
                  {tool.desc}
                </p>
                <div className="mt-4">
                  <Button href={`/tools/${tool.slug}`} variant="outline" className="w-full justify-center">
                    <span className="en">View Details</span><span className="ar ml-2">عرض التفاصيل</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
