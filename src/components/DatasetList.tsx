'use client';
import { resolveMediaUrl } from '@/lib/utils';

import React, { useState } from 'react';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';

type Category = {
  id: string;
  title: string;
};

type Dataset = {
  id: string;
  title: string;
  description: string;
  apiEndpoint?: string;
  file?: { url?: string } | string;
  topic?: Category[] | string[];
  date: string;
};

export default function DatasetList({ datasets, categories = [] }: { datasets: Dataset[], categories?: Category[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (e.target.checked) {
      setSelectedTopics([...selectedTopics, value]);
    } else {
      setSelectedTopics(selectedTopics.filter(t => t !== value));
    }
  };

  const filteredDatasets = datasets.filter(ds => {
    const dsTopics = ds.topic?.map(t => typeof t === 'string' ? t : t.id) || [];
    const topicTitles = dsTopics.map(id => categories.find(c => c.id === id)?.title).filter(Boolean).join(' ');
    
    const searchable = `${ds.title} ${ds.description} ${topicTitles}`.toLowerCase();
    const matchSearch = searchable.includes(searchQuery.toLowerCase());
    
    const matchTopic = selectedTopics.length === 0 || dsTopics.some(id => selectedTopics.includes(id));
    
    return matchSearch && matchTopic;
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
            placeholder="Search datasets…" 
            className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[14px] text-ink outline-none focus:border-ink/30 transition-colors"
          />
        </div>

        {categories && categories.length > 0 && (
          <div className="flex flex-col gap-3">
            <label className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink">
              <span className="en">Topic</span><span className="ar ml-2">موضوع</span>
            </label>
            <div className="flex flex-col gap-2">
              {categories.map(category => (
                <label key={category.id} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    value={category.id} 
                    checked={selectedTopics.includes(category.id)} 
                    onChange={handleTopicChange} 
                    className="w-4 h-4 accent-ink"
                  />
                  <span className="text-[14px] text-ink group-hover:text-ink-soft transition-colors">
                    {category.title}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        <Button 
          variant="outline" 
          onClick={() => { setSearchQuery(''); setSelectedTopics([]); }}
          className="w-full justify-center"
        >
          <span className="en">Clear filters</span><span className="ar ml-2">مسح عوامل التصفية</span>
        </Button>
      </aside>

      <div className="flex flex-col gap-8">
        {filteredDatasets.length === 0 ? (
          <div className="py-10 text-center text-ink-soft bg-[#FAFBFB] rounded-[16px] border border-ink/10">
            <span className="en block">No datasets match your search.</span>
            <span className="ar block mt-2">لا توجد مجموعات بيانات مطابقة للبحث.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredDatasets.map((ds) => {
              const fileUrl = ds.file && typeof ds.file !== 'string' && resolveMediaUrl(ds.file.url) ? ds.file.url : undefined;
              
              return (
                <div key={ds.id} className="flex flex-col gap-4 p-6 rounded-[16px] border border-ink/10 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex flex-col items-start gap-2 max-w-[700px]">
                      <Typography variant="h3" className="text-ink m-0">
                        <span className="en block">{ds.title}</span><span className="ar block mt-1">{ds.title}</span>
                      </Typography>
                      <div className="text-[14px] text-ink-soft">
                        <span className="en">{new Date(ds.date).toLocaleDateString('en-GB')}</span>
                        <span className="ar hidden group-[[data-lang=ar]]:inline-block">{new Date(ds.date).toLocaleDateString('ar-EG')}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                      {ds.apiEndpoint && (
                        <div className="text-[13px] bg-ink/5 text-ink px-3 py-1.5 rounded-full font-mono flex-shrink-0 w-full sm:w-auto text-center">
                          API: {ds.apiEndpoint}
                        </div>
                      )}
                      
                      {fileUrl && (
                        <Button href={fileUrl} variant="outline" className="flex items-center justify-center gap-2 w-full sm:w-auto">
                          <span>↓</span> <span className="en">Download CSV</span><span className="ar ml-2">تحميل</span>
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="w-full h-[1px] bg-ink/5 my-1"></div>
                  
                  <div>
                    <Typography variant="eyebrow" className="text-ink-soft mb-2">
                      <span className="en">Brief Insights</span><span className="ar ml-2">رؤى موجزة</span>
                    </Typography>
                    <p className="text-[15px] leading-relaxed text-ink/80 m-0 whitespace-pre-wrap">
                      {ds.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
