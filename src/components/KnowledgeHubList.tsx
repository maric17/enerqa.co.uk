'use client';
import { resolveMediaUrl } from '@/lib/utils';
import Link from 'next/link';
import React, { useState } from 'react';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type Category = {
  id: string;
  title: string;
};

type Publication = {
  id: string;
  type: string;
  title: string;
  date: string;
  heading: string;
  excerpt: string;
  file?: { url?: string } | string;
  bgGradientType: string;
  topic?: Category[] | string[];
  slug?: string;
};

export default function KnowledgeHubList({ publications, categories = [] }: { publications: Publication[], categories?: Category[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [types, setTypes] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (e.target.checked) {
      setTypes([...types, value]);
    } else {
      setTypes(types.filter(t => t !== value));
    }
    setCurrentPage(1);
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (e.target.checked) {
      setSelectedTopics([...selectedTopics, value]);
    } else {
      setSelectedTopics(selectedTopics.filter(t => t !== value));
    }
    setCurrentPage(1);
  };

  const filteredPubs = publications.filter(pub => {
    const pubTopics = pub.topic?.map(t => typeof t === 'string' ? t : t.id) || [];
    
    // Check if pub topics map to category titles in our search string
    const topicTitles = pubTopics.map(id => categories.find(c => c.id === id)?.title).filter(Boolean).join(' ');
    const searchable = `${pub.title} ${pub.heading} ${pub.type} ${topicTitles}`.toLowerCase();
    
    const matchSearch = searchable.includes(searchQuery.toLowerCase());
    const matchType = types.length === 0 || types.includes(pub.type);
    const matchTopic = selectedTopics.length === 0 || pubTopics.some(id => selectedTopics.includes(id));
    
    return matchSearch && matchType && matchTopic;
  });

  const totalPages = Math.ceil(filteredPubs.length / itemsPerPage);
  const paginatedPubs = filteredPubs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
            placeholder="Search title or topic…" 
            className="w-full bg-white border border-ink/10 rounded-md px-4 py-2.5 text-[14px] text-ink outline-none focus:border-ink/30 transition-colors"
          />
        </div>
        
        <div className="flex flex-col gap-3">
          <label className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink">
            <span className="en">Publication type</span><span className="ar ml-2">نوع المنشور</span>
          </label>
          <div className="flex flex-col gap-2">
            {[
              { val: 'White Paper', en: 'White Paper', ar: 'ورقة بيضاء' },
              { val: 'Case Study', en: 'Case Study', ar: 'دراسة حالة' },
              { val: 'Article', en: 'Article', ar: 'مقال' },
              { val: 'Research', en: 'Research', ar: 'بحث' }
            ].map(type => (
              <label key={type.val} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  value={type.val} 
                  checked={types.includes(type.val)} 
                  onChange={handleTypeChange} 
                  className="w-4 h-4 accent-ink"
                />
                <span className="text-[14px] text-ink group-hover:text-ink-soft transition-colors">
                  <span className="en">{type.en}</span><span className="ar hidden group-[[data-lang=ar]]:inline-block">{type.ar || type.en}</span>
                </span>
              </label>
            ))}
          </div>
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
          variant="secondary" 
          onClick={() => { setSearchQuery(''); setTypes([]); setSelectedTopics([]); setCurrentPage(1); }}
          className="w-full justify-center"
        >
          <span className="en">Clear filters</span><span className="ar ml-2">مسح عوامل التصفية</span>
        </Button>
      </aside>

      <div className="flex flex-col gap-8">
        {filteredPubs.length === 0 ? (
          <div className="py-10 text-center text-ink-soft bg-[#FAFBFB] rounded-[16px] border border-ink/10">
            <span className="en block">No publications match your filters.</span>
            <span className="ar block mt-2">لا توجد منشورات مطابقة لعوامل التصفية.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4" id="publications">
            {paginatedPubs.map((pub) => (
              <div key={pub.id} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 p-6 rounded-[16px] border border-ink/10 hover:border-ink/30 transition-colors bg-white shadow-sm hover:shadow-md">
                <div className="flex flex-col items-start gap-3">
                  <Badge variant="solid">
                    <span className="en">{pub.type}</span><span className="ar">{pub.type}</span>
                  </Badge>
                  <Typography variant="h3" className="text-ink m-0">
                    {pub.slug ? (
                      <Link href={`/knowledge-hub/${pub.slug}`} className="hover:text-ink-soft transition-colors no-underline text-inherit block">
                        <span className="en block">{pub.title}</span><span className="ar block mt-1">{pub.title}</span>
                      </Link>
                    ) : pub.file && typeof pub.file !== 'string' && resolveMediaUrl(pub.file.url) ? (
                      <a href={resolveMediaUrl(pub.file.url)} target="_blank" rel="noopener noreferrer" className="hover:text-ink-soft transition-colors no-underline text-inherit block">
                        <span className="en block">{pub.title}</span><span className="ar block mt-1">{pub.title}</span>
                      </a>
                    ) : (
                      <>
                        <span className="en block">{pub.title}</span><span className="ar block mt-1">{pub.title}</span>
                      </>
                    )}
                  </Typography>
                  <div className="text-[14px] text-ink-soft mt-1">
                    <span className="en">{new Date(pub.date).toLocaleDateString('en-GB')}</span>
                    <span className="ar hidden group-[[data-lang=ar]]:inline-block">{new Date(pub.date).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
                <div className="flex items-center md:items-start justify-start md:justify-end">
                  {pub.file && typeof pub.file !== 'string' && resolveMediaUrl(pub.file.url) ? (
                    <Button href={resolveMediaUrl(pub.file.url)} variant="secondary" className="flex items-center gap-2">
                      <span>↓</span> <span className="en">Download PDF</span><span className="ar ml-2">تحميل</span>
                    </Button>
                  ) : (
                    <span className="text-[13px] text-ink/40">
                      <span className="en">No file available</span><span className="ar hidden group-[[data-lang=ar]]:inline-block">لا يوجد ملف متاح</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 mt-6 pt-6 border-t border-ink/10">
                <Button
                  variant="secondary"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1));
                    document.getElementById('publications')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="disabled:opacity-30 disabled:pointer-events-none"
                >
                  <span className="en">Previous</span><span className="ar ml-2">السابق</span>
                </Button>
                <span className="text-[14px] font-medium text-ink/60">
                  <span className="en">Page {currentPage} of {totalPages}</span>
                  <span className="ar hidden group-[[data-lang=ar]]:inline-block">صفحة {currentPage} من {totalPages}</span>
                </span>
                <Button
                  variant="secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage(p => Math.min(totalPages, p + 1));
                    document.getElementById('publications')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="disabled:opacity-30 disabled:pointer-events-none"
                >
                  <span className="en">Next</span><span className="ar ml-2">التالي</span>
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-ink text-white p-8 md:p-12 rounded-[16px] overflow-hidden relative" id="tools">
          <div className="absolute inset-0 bg-cover bg-center bg-[url('/assets/images/gas-energy.jpg')]"></div>
          <div className="hero-insights-overlay z-10 opacity-80"></div>
          <div className="relative z-10 flex flex-col gap-6">
            <Typography variant="eyebrow" className="text-white/60 mb-0">
              <span className="en">Tools overview</span><span className="ar ml-2">نظرة على الأدوات</span>
            </Typography>
            <Typography variant="h2" className="text-white m-0">
              <span className="en block">Interactive tools &amp; API environment</span>
              <span className="ar block text-[0.8em] mt-2 text-white/90">أدوات تفاعلية وبيئة برمجية (API)</span>
            </Typography>
            <p className="text-[15px] md:text-[17px] leading-[1.6] text-white/80 max-w-[700px] m-0">
              <span className="en block">Today: a downloadable ESG Readiness Assessment tool. This container is reserved for forthcoming self-serve calculators, data dashboards and API-connected client portals.</span>
              <span className="ar block mt-3">حاليًا: أداة تقييم جاهزية الحوكمة البيئية قابلة للتحميل. هذا القسم مخصص لأدوات حاسبة ذاتية الخدمة ولوحات بيانات وبوابات عملاء متصلة بواجهات برمجية قادمة.</span>
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <Button href="/contact" variant="outline">
                <span className="en">Download ESG Readiness Tool (.xlsx)</span><span className="ar ml-2">تحميل أداة جاهزية الحوكمة (.xlsx)</span>
              </Button>
            </div>
            <div className="flex gap-4 mt-8 text-[24px] text-white/40">
              <span title="Energy modelling tool">⚙</span>
              <span title="Emissions calculator">∑</span>
              <span title="Data dashboard">▤</span>
              <span title="API access">⟡</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
