'use client';
import { resolveMediaUrl } from '@/lib/utils';

import React, { useState } from 'react';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';

type Category = {
  id: string;
  title: string;
};

type LearningMaterial = {
  id: string;
  title: string;
  type: 'PDF' | 'Video' | 'Course' | 'Toolkit' | 'Presentation';
  description: string;
  source?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  file?: { url?: string } | string;
  url?: string;
  topic?: Category[] | string[];
};

export default function LearningMaterialsList({ materials, categories = [] }: { materials: LearningMaterial[], categories?: Category[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('');

  const types = ['PDF', 'Video', 'Course', 'Toolkit', 'Presentation'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (e.target.checked) {
      setSelectedTypes([...selectedTypes, value]);
    } else {
      setSelectedTypes(selectedTypes.filter(t => t !== value));
    }
  };

  const filteredMaterials = materials.filter(m => {
    const mTopics = m.topic?.map(t => typeof t === 'string' ? t : t.id) || [];
    const topicTitles = mTopics.map(id => categories.find(c => c.id === id)?.title).filter(Boolean).join(' ');
    
    const searchable = `${m.title} ${m.description} ${m.source || ''} ${topicTitles}`.toLowerCase();
    const matchSearch = searchable.includes(searchQuery.toLowerCase());
    
    const matchType = selectedTypes.length === 0 || selectedTypes.includes(m.type);
    const matchLevel = selectedLevel === '' || m.level === selectedLevel;
    
    return matchSearch && matchType && matchLevel;
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
            placeholder="Search materials…" 
            className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[14px] text-ink outline-none focus:border-ink/30 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink">
            <span className="en">Format Type</span><span className="ar ml-2">نوع التنسيق</span>
          </label>
          <div className="flex flex-col gap-2">
            {types.map(type => (
              <label key={type} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  value={type} 
                  checked={selectedTypes.includes(type)} 
                  onChange={handleTypeChange} 
                  className="w-4 h-4 accent-ink"
                />
                <span className="text-[14px] text-ink group-hover:text-ink-soft transition-colors">
                  {type}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink">
            <span className="en">Difficulty Level</span><span className="ar ml-2">مستوى الصعوبة</span>
          </label>
          <select 
            value={selectedLevel} 
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[14px] text-ink outline-none focus:border-ink/30 transition-colors"
          >
            <option value="">All Levels</option>
            {levels.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => { setSearchQuery(''); setSelectedTypes([]); setSelectedLevel(''); }}
          className="w-full justify-center"
        >
          <span className="en">Clear filters</span><span className="ar ml-2">مسح عوامل التصفية</span>
        </Button>
      </aside>

      <div className="flex flex-col gap-8">
        {filteredMaterials.length === 0 ? (
          <div className="py-10 text-center text-ink-soft bg-[#FAFBFB] rounded-[16px] border border-ink/10">
            <span className="en block">No materials match your search.</span>
            <span className="ar block mt-2">لا توجد مواد مطابقة للبحث.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMaterials.map((m) => {
              const fileUrl = m.file && typeof m.file !== 'string' && resolveMediaUrl(m.file.url) ? m.file.url : resolveMediaUrl(m.url);
              
              return (
                <div key={m.id} className="flex flex-col gap-4 p-6 rounded-[16px] border border-ink/10 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start gap-4">
                    <span className="inline-block bg-ink/5 text-ink px-3 py-1 rounded-full text-[12px] font-bold tracking-wider uppercase">
                      {m.type}
                    </span>
                    {m.level && (
                      <span className="inline-block text-ink-soft text-[12px] uppercase tracking-wider font-bold">
                        {m.level}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 flex-1">
                    <Typography variant="h3" className="text-ink m-0 line-clamp-2">
                      <span className="en block">{m.title}</span><span className="ar block mt-1">{m.title}</span>
                    </Typography>
                    {m.source && (
                      <div className="text-[13px] text-ink-soft font-mono">
                        Source: {m.source}
                      </div>
                    )}
                    <p className="text-[14px] leading-relaxed text-ink/80 m-0 mt-2 line-clamp-3">
                      {m.description}
                    </p>
                  </div>
                  
                  {fileUrl && (
                    <div className="mt-4 pt-4 border-t border-ink/10">
                      <Button href={fileUrl} variant="outline" className="w-full justify-center text-[13px]">
                        {m.type === 'Video' || m.type === 'Course' ? (
                          <><span className="en">View Online</span><span className="ar ml-2">عرض على الانترنت</span></>
                        ) : (
                          <><span className="en">Download Resource</span><span className="ar ml-2">تحميل المورد</span></>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
