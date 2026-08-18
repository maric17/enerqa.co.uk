'use client';

import React, { useState } from 'react';
import Link from 'next/link';

type Publication = {
  id: string;
  type: string;
  title: string;
  date: string;
  heading: string;
  excerpt: string;
  file?: any;
  bgGradientType: string;
};

export default function KnowledgeHubList({ publications }: { publications: Publication[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [types, setTypes] = useState<string[]>([]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (e.target.checked) {
      setTypes([...types, value]);
    } else {
      setTypes(types.filter(t => t !== value));
    }
  };

  const filteredPubs = publications.filter(pub => {
    const searchable = `${pub.title} ${pub.heading} ${pub.type}`.toLowerCase();
    const matchSearch = searchable.includes(searchQuery.toLowerCase());
    const matchType = types.length === 0 || types.includes(pub.type);
    return matchSearch && matchType;
  });

  return (
    <div className="kh-layout" style={{ marginTop: 16 }}>
      <aside className="filter-matrix reveal">
        <h5><span className="en">Refine results</span><span className="ar">تصفية النتائج</span></h5>
        <div className="f-group">
          <label className="f-label en">Keyword</label><label className="f-label ar">كلمة مفتاحية</label>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search title or topic…" />
        </div>
        <div className="f-group checks">
          <label className="f-label en">Publication type</label><label className="f-label ar">نوع المنشور</label>
          <label><input type="checkbox" value="Advisory Note" checked={types.includes('Advisory Note')} onChange={handleTypeChange} /><span className="en">Advisory Note</span></label>
          <label><input type="checkbox" value="Case Study" checked={types.includes('Case Study')} onChange={handleTypeChange} /><span className="en">Case Study</span></label>
          <label><input type="checkbox" value="Technical Paper" checked={types.includes('Technical Paper')} onChange={handleTypeChange} /><span className="en">Technical Paper</span></label>
          <label><input type="checkbox" value="Strategic Report" checked={types.includes('Strategic Report')} onChange={handleTypeChange} /><span className="en">Strategic Report</span></label>
        </div>
        <button className="btn" onClick={() => { setSearchQuery(''); setTypes([]); }}>
          <span className="en">Clear filters</span><span className="ar">مسح عوامل التصفية</span>
        </button>
      </aside>

      <div>
        {filteredPubs.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink-soft)' }}>
            <span className="en">No publications match your filters.</span><span className="ar">لا توجد منشورات مطابقة لعوامل التصفية.</span>
          </div>
        ) : (
          filteredPubs.map((pub) => (
            <div key={pub.id} className="pub-row reveal in">
              <div className="pub-main">
                <span className="tag on en">{pub.type}</span><span className="tag on ar">{pub.type}</span>
                <h4><span className="en">{pub.title}</span><span className="ar">{pub.title}</span></h4>
                <div className="pub-meta en">{new Date(pub.date).toLocaleDateString('en-GB')}</div><div className="pub-meta ar">{new Date(pub.date).toLocaleDateString('ar-EG')}</div>
              </div>
              <div className="dl-flags">
                {pub.file && typeof pub.file !== 'string' && pub.file.url ? (
                  <a href={pub.file.url} download>↓ <span className="en">Download PDF</span><span className="ar">تحميل</span></a>
                ) : (
                  <span className="en" style={{opacity: 0.5}}>No file available</span>
                )}
              </div>
            </div>
          ))
        )}

        <div className="tools-env reveal in" id="tools">
          <span className="eyebrow"><span className="en">Tools overview</span><span className="ar">نظرة على الأدوات</span></span>
          <h4><span className="en">Interactive tools &amp; API environment</span><span className="ar">أدوات تفاعلية وبيئة برمجية (API)</span></h4>
          <p>
            <span className="en">Today: a downloadable ESG Readiness Assessment tool. This container is reserved for forthcoming self-serve calculators, data dashboards and API-connected client portals.</span>
            <span className="ar">حاليًا: أداة تقييم جاهزية الحوكمة البيئية قابلة للتحميل. هذا القسم مخصص لأدوات حاسبة ذاتية الخدمة ولوحات بيانات وبوابات عملاء متصلة بواجهات برمجية قادمة.</span>
          </p>
          <div className="hero-cta" style={{ justifyContent: 'center', marginBottom: 18 }}>
            <Link href="/contact" className="btn"><span className="en">Download ESG Readiness Tool (.xlsx)</span><span className="ar">تحميل أداة جاهزية الحوكمة (.xlsx)</span></Link>
          </div>
          <div className="stub-icons">
            <span title="Energy modelling tool">⚙</span>
            <span title="Emissions calculator">∑</span>
            <span title="Data dashboard">▤</span>
            <span title="API access">⟡</span>
          </div>
        </div>
      </div>
    </div>
  );
}
