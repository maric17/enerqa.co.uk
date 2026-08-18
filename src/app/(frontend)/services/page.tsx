import React from 'react';
import Link from 'next/link';

export default function ServicesPage() {
  return (
    <>
      <section className="page-hero letterbox">
        <span className="matte-label">enerQA / reel 03</span>
        <span className="matte-scene">SCENE 03 — SERVICES</span>
        <div className="still c"></div>
        <div className="page-hero-copy">
          <div className="crumbs"><Link href="/">Home</Link> / <span className="en">Domains &amp; Services</span><span className="ar">المجالات والخدمات</span></div>
          <h1><span className="en">Four domains, tailored to your stage.</span><span className="ar">أربعة مجالات، مصمّمة لمرحلتك.</span></h1>
        </div>
      </section>

      <section className="band tight">
        <div className="wrap" style={{ marginBottom: 40 }}>
          <div className="article-feature reveal">
            <div>
              <span className="section-index en">01 — Climate Change</span><span className="section-index ar">01 — تغيّر المناخ</span>
              <h2><span className="en">Climate Change</span><span className="ar">تغيّر المناخ</span></h2>
              <p className="lede" style={{ marginTop: 16 }}><span className="en">Solutions for climate project financing, strategies and action plans to mitigate and adapt to climate effects, and transparent climate reporting.</span><span className="ar">حلول لتمويل مشاريع المناخ، واستراتيجيات وخطط عمل للتخفيف والتكيف مع آثار تغيّر المناخ، وإبلاغ مناخي شفاف.</span></p>
            </div>
            <div className="still b" style={{ minHeight: 300, borderRadius: 18 }}></div>
          </div>
        </div>
      </section>
      
      <section className="band" id="climate">
        <div className="wrap">
          <div className="service-block reveal">
            <div className="snum">01.1</div>
            <div>
              <h3><span className="en">Climate Finance</span><span className="ar">تمويل المناخ</span></h3>
              <p style={{ marginTop: 10 }}><span className="en">Readiness support for accessing climate funds and structuring bankable, fundable proposals.</span><span className="ar">دعم الجاهزية للوصول إلى صناديق المناخ وهيكلة مقترحات قابلة للتمويل.</span></p>
              <ul className="deliv en"><li>Fund readiness diagnostics (GCF, Adaptation Fund, GEF)</li><li>Concept note &amp; proposal development</li><li>Financial structuring &amp; blended finance advisory</li></ul>
              <ul className="deliv ar"><li>تشخيص الجاهزية للصناديق (GCF وGEF وصندوق التكيف)</li><li>إعداد مذكرات المفاهيم والمقترحات</li><li>الهيكلة المالية واستشارات التمويل المُدمج</li></ul>
            </div>
            <div className="inquiry-mini">
              <h5><span className="en">Ask about this service</span><span className="ar">استفسر عن هذه الخدمة</span></h5>
              <input type="text" placeholder="Full name" className="en" /><input type="text" placeholder="الاسم الكامل" className="ar" />
              <input type="email" placeholder="Email" className="en" /><input type="email" placeholder="البريد الإلكتروني" className="ar" />
              <textarea placeholder="Brief context" className="en"></textarea><textarea placeholder="نبذة عن السياق" className="ar"></textarea>
              <button className="btn"><span className="en">Send inquiry</span><span className="ar">إرسال الاستفسار</span></button>
            </div>
          </div>
          <div id="climate-finance"></div>

          <div className="service-block reveal">
            <div className="snum">01.2</div>
            <div>
              <h3><span className="en">Climate Action — Mitigation &amp; Adaptation</span><span className="ar">العمل المناخي — التخفيف والتكيف</span></h3>
              <p style={{ marginTop: 10 }}><span className="en">Strategy and action-plan design that translates national commitments into implementable projects.</span><span className="ar">تصميم استراتيجيات وخطط عمل تُترجم الالتزامات الوطنية إلى مشاريع قابلة للتنفيذ.</span></p>
              <ul className="deliv en"><li>NDC &amp; NAP technical support</li><li>Vulnerability &amp; risk assessments</li><li>Sector mitigation pathways</li></ul>
              <ul className="deliv ar"><li>دعم فني للمساهمات المحددة وطنيًا وخطط التكيف الوطنية</li><li>تقييمات الهشاشة والمخاطر</li><li>مسارات تخفيف قطاعية</li></ul>
            </div>
            <div className="inquiry-mini">
              <h5><span className="en">Ask about this service</span><span className="ar">استفسر عن هذه الخدمة</span></h5>
              <input type="text" placeholder="Full name" className="en" /><input type="text" placeholder="الاسم الكامل" className="ar" />
              <input type="email" placeholder="Email" className="en" /><input type="email" placeholder="البريد الإلكتروني" className="ar" />
              <textarea placeholder="Brief context" className="en"></textarea><textarea placeholder="نبذة عن السياق" className="ar"></textarea>
              <button className="btn"><span className="en">Send inquiry</span><span className="ar">إرسال الاستفسار</span></button>
            </div>
          </div>
          <div id="climate-action"></div>

          <div className="service-block reveal">
            <div className="snum">01.3</div>
            <div>
              <h3><span className="en">Transparency &amp; Reporting</span><span className="ar">الشفافية والإبلاغ</span></h3>
              <p style={{ marginTop: 10 }}><span className="en">MRV systems and donor-grade reporting that hold up under external review.</span><span className="ar">أنظمة قياس وإبلاغ وتحقق (MRV) وتقارير بمعايير المانحين تصمد أمام المراجعة الخارجية.</span></p>
              <ul className="deliv en"><li>Biennial transparency reports (BTRs)</li><li>MRV system design</li><li>Donor &amp; regulator reporting packages</li></ul>
              <ul className="deliv ar"><li>تقارير الشفافية الثنائية</li><li>تصميم أنظمة القياس والإبلاغ والتحقق</li><li>حزم إبلاغ للمانحين والجهات الرقابية</li></ul>
            </div>
            <div className="inquiry-mini">
              <h5><span className="en">Ask about this service</span><span className="ar">استفسر عن هذه الخدمة</span></h5>
              <input type="text" placeholder="Full name" className="en" /><input type="text" placeholder="الاسم الكامل" className="ar" />
              <input type="email" placeholder="Email" className="en" /><input type="email" placeholder="البريد الإلكتروني" className="ar" />
              <textarea placeholder="Brief context" className="en"></textarea><textarea placeholder="نبذة عن السياق" className="ar"></textarea>
              <button className="btn"><span className="en">Send inquiry</span><span className="ar">إرسال الاستفسار</span></button>
            </div>
          </div>
          <div id="transparency"></div>
        </div>
      </section>

      <section className="band forest tight">
        <div className="wrap" style={{ marginBottom: 40 }}>
          <div className="article-feature reveal">
            <div>
              <span className="section-index en">02 — Environment</span><span className="section-index ar">02 — البيئة</span>
              <h2><span className="en">Environment</span><span className="ar">البيئة</span></h2>
              <p className="lede" style={{ marginTop: 16 }}><span className="en">Environmental assessments, management plans, and ESG (Environmental, Social &amp; Governance) reporting.</span><span className="ar">تقييمات بيئية وخطط إدارة وتقارير الحوكمة البيئية والاجتماعية (ESG).</span></p>
            </div>
            <div className="still" style={{ minHeight: 300, borderRadius: 18 }}></div>
          </div>
        </div>
      </section>
      
      <section className="band" id="environment">
        <div className="wrap">
          <div className="service-block reveal">
            <div className="snum">02.1</div>
            <div>
              <h3><span className="en">ESG Reporting</span><span className="ar">تقارير الحوكمة (ESG)</span></h3>
              <p style={{ marginTop: 10 }}><span className="en">Readiness assessment and reporting frameworks aligned to investor and regulatory expectations.</span><span className="ar">تقييم الجاهزية وأطر إبلاغ متوافقة مع توقعات المستثمرين والجهات الرقابية.</span></p>
              <ul className="deliv en"><li>ESG readiness diagnostics &amp; scoring</li><li>Materiality assessments</li><li>Disclosure &amp; reporting framework design</li></ul>
              <ul className="deliv ar"><li>تشخيص وتقييم جاهزية الحوكمة البيئية والاجتماعية</li><li>تقييمات الأهمية النسبية</li><li>تصميم أطر الإفصاح والإبلاغ</li></ul>
            </div>
            <div className="inquiry-mini">
              <h5><span className="en">Ask about this service</span><span className="ar">استفسر عن هذه الخدمة</span></h5>
              <input type="text" placeholder="Full name" className="en" /><input type="text" placeholder="الاسم الكامل" className="ar" />
              <input type="email" placeholder="Email" className="en" /><input type="email" placeholder="البريد الإلكتروني" className="ar" />
              <textarea placeholder="Brief context" className="en"></textarea><textarea placeholder="نبذة عن السياق" className="ar"></textarea>
              <button className="btn"><span className="en">Send inquiry</span><span className="ar">إرسال الاستفسار</span></button>
            </div>
          </div>
          <div id="esg"></div>

          <div className="service-block reveal">
            <div className="snum">02.2</div>
            <div>
              <h3><span className="en">Environmental Assessments</span><span className="ar">التقييمات البيئية</span></h3>
              <p style={{ marginTop: 10 }}><span className="en">Environmental and social impact assessments and management plans for projects across sectors.</span><span className="ar">تقييمات الأثر البيئي والاجتماعي وخطط الإدارة للمشاريع في مختلف القطاعات.</span></p>
              <ul className="deliv en"><li>ESIA / ESMP development</li><li>Stakeholder engagement design</li><li>Safeguards compliance &amp; monitoring</li></ul>
              <ul className="deliv ar"><li>إعداد تقييمات وخطط الأثر البيئي والاجتماعي</li><li>تصميم مشاركة أصحاب المصلحة</li><li>الامتثال للضمانات والمتابعة</li></ul>
            </div>
            <div className="inquiry-mini">
              <h5><span className="en">Ask about this service</span><span className="ar">استفسر عن هذه الخدمة</span></h5>
              <input type="text" placeholder="Full name" className="en" /><input type="text" placeholder="الاسم الكامل" className="ar" />
              <input type="email" placeholder="Email" className="en" /><input type="email" placeholder="البريد الإلكتروني" className="ar" />
              <textarea placeholder="Brief context" className="en"></textarea><textarea placeholder="نبذة عن السياق" className="ar"></textarea>
              <button className="btn"><span className="en">Send inquiry</span><span className="ar">إرسال الاستفسار</span></button>
            </div>
          </div>
          <div id="assessments"></div>
        </div>
      </section>

      <section className="band tight">
        <div className="wrap" style={{ marginBottom: 40 }}>
          <div className="article-feature reveal">
            <div>
              <span className="section-index en">03 — Energy</span><span className="section-index ar">03 — الطاقة</span>
              <h2><span className="en">Energy</span><span className="ar">الطاقة</span></h2>
              <p className="lede" style={{ marginTop: 16 }}><span className="en">Management of existing consumption, development of renewable energy projects, and energy modelling &amp; policy analysis.</span><span className="ar">إدارة الاستهلاك القائم، وتطوير مشاريع الطاقة المتجددة، ونمذجة الطاقة وتحليل السياسات.</span></p>
            </div>
            <div className="still d" style={{ minHeight: 300, borderRadius: 18 }}></div>
          </div>
        </div>
      </section>

      <section className="band" id="energy">
        <div className="wrap">
          <div className="service-block reveal">
            <div className="snum">03.1</div>
            <div>
              <h3><span className="en">Energy Management</span><span className="ar">إدارة الطاقة</span></h3>
              <p style={{ marginTop: 10 }}><span className="en">Audits and monitoring systems that cut consumption without cutting output.</span><span className="ar">تدقيقات وأنظمة رصد لخفض الاستهلاك دون التأثير في الإنتاج.</span></p>
              <ul className="deliv en"><li>Energy audits &amp; benchmarking</li><li>Metering &amp; monitoring system design</li><li>Demand-side management planning</li></ul>
              <ul className="deliv ar"><li>تدقيقات الطاقة والمقارنة المرجعية</li><li>تصميم أنظمة العدادات والرصد</li><li>تخطيط إدارة جانب الطلب</li></ul>
            </div>
            <div className="inquiry-mini">
              <h5><span className="en">Ask about this service</span><span className="ar">استفسر عن هذه الخدمة</span></h5>
              <input type="text" placeholder="Full name" className="en" /><input type="text" placeholder="الاسم الكامل" className="ar" />
              <input type="email" placeholder="Email" className="en" /><input type="email" placeholder="البريد الإلكتروني" className="ar" />
              <textarea placeholder="Brief context" className="en"></textarea><textarea placeholder="نبذة عن السياق" className="ar"></textarea>
              <button className="btn"><span className="en">Send inquiry</span><span className="ar">إرسال الاستفسار</span></button>
            </div>
          </div>
          <div id="energy-mgmt"></div>

          <div className="service-block reveal">
            <div className="snum">03.2</div>
            <div>
              <h3><span className="en">Renewable Energy Projects Development</span><span className="ar">تطوير مشاريع الطاقة المتجددة</span></h3>
              <p style={{ marginTop: 10 }}><span className="en">Technical and financial development support from resource assessment to financial close.</span><span className="ar">دعم فني ومالي من تقييم الموارد وحتى الإغلاق المالي.</span></p>
              <ul className="deliv en"><li>Resource &amp; site assessment</li><li>Feasibility &amp; bankability studies</li><li>I-RECs &amp; renewable certification advisory</li></ul>
              <ul className="deliv ar"><li>تقييم الموارد والموقع</li><li>دراسات الجدوى وقابلية التمويل</li><li>استشارات شهادات الطاقة المتجددة I-REC</li></ul>
            </div>
            <div className="inquiry-mini">
              <h5><span className="en">Ask about this service</span><span className="ar">استفسر عن هذه الخدمة</span></h5>
              <input type="text" placeholder="Full name" className="en" /><input type="text" placeholder="الاسم الكامل" className="ar" />
              <input type="email" placeholder="Email" className="en" /><input type="email" placeholder="البريد الإلكتروني" className="ar" />
              <textarea placeholder="Brief context" className="en"></textarea><textarea placeholder="نبذة عن السياق" className="ar"></textarea>
              <button className="btn"><span className="en">Send inquiry</span><span className="ar">إرسال الاستفسار</span></button>
            </div>
          </div>
          <div id="renewables"></div>

          <div className="service-block reveal">
            <div className="snum">03.3</div>
            <div>
              <h3><span className="en">Energy Modelling &amp; Policy Analysis</span><span className="ar">نمذجة الطاقة وتحليل السياسات</span></h3>
              <p style={{ marginTop: 10 }}><span className="en">Scenario modelling that informs policy and investment decisions with defensible numbers.</span><span className="ar">نمذجة سيناريوهات توجّه قرارات السياسات والاستثمار بأرقام موثوقة.</span></p>
              <ul className="deliv en"><li>Supply &amp; demand modelling</li><li>Policy &amp; tariff impact analysis</li><li>Least-cost planning</li></ul>
              <ul className="deliv ar"><li>نمذجة العرض والطلب</li><li>تحليل أثر السياسات والتعرفة</li><li>التخطيط الأقل تكلفة</li></ul>
            </div>
            <div className="inquiry-mini">
              <h5><span className="en">Ask about this service</span><span className="ar">استفسر عن هذه الخدمة</span></h5>
              <input type="text" placeholder="Full name" className="en" /><input type="text" placeholder="الاسم الكامل" className="ar" />
              <input type="email" placeholder="Email" className="en" /><input type="email" placeholder="البريد الإلكتروني" className="ar" />
              <textarea placeholder="Brief context" className="en"></textarea><textarea placeholder="نبذة عن السياق" className="ar"></textarea>
              <button className="btn"><span className="en">Send inquiry</span><span className="ar">إرسال الاستفسار</span></button>
            </div>
          </div>
        </div>
      </section>

      <section className="band forest tight">
        <div className="wrap" style={{ marginBottom: 40 }}>
          <div className="article-feature reveal">
            <div>
              <span className="section-index en">04 — Business Solutions</span><span className="section-index ar">04 — حلول الأعمال</span>
              <h2><span className="en">Business Solutions</span><span className="ar">حلول الأعمال</span></h2>
              <p className="lede" style={{ marginTop: 16 }}><span className="en">Business models and feasibility studies, green credit lines, and supporting studies tailored to each client's needs.</span><span className="ar">نماذج أعمال ودراسات جدوى، وخطوط ائتمان أخضر، ودراسات داعمة مصممة لاحتياجات كل عميل.</span></p>
            </div>
            <div className="still b" style={{ minHeight: 300, borderRadius: 18 }}></div>
          </div>
        </div>
      </section>

      <section className="band" id="business">
        <div className="wrap">
          <div className="service-block reveal">
            <div className="snum">04.1</div>
            <div>
              <h3><span className="en">Green Credit Lines</span><span className="ar">خطوط الائتمان الأخضر</span></h3>
              <p style={{ marginTop: 10 }}><span className="en">Structuring and eligibility frameworks connecting borrowers with green finance facilities.</span><span className="ar">هيكلة وأطر أهلية تربط المقترضين بمرافق التمويل الأخضر.</span></p>
              <ul className="deliv en"><li>Eligibility criteria &amp; taxonomy alignment</li><li>Green facility structuring support</li><li>Environmental &amp; social risk categorisation</li></ul>
              <ul className="deliv ar"><li>معايير الأهلية والتوافق مع التصنيف الأخضر</li><li>دعم هيكلة المرافق الخضراء</li><li>تصنيف المخاطر البيئية والاجتماعية</li></ul>
            </div>
            <div className="inquiry-mini">
              <h5><span className="en">Ask about this service</span><span className="ar">استفسر عن هذه الخدمة</span></h5>
              <input type="text" placeholder="Full name" className="en" /><input type="text" placeholder="الاسم الكامل" className="ar" />
              <input type="email" placeholder="Email" className="en" /><input type="email" placeholder="البريد الإلكتروني" className="ar" />
              <textarea placeholder="Brief context" className="en"></textarea><textarea placeholder="نبذة عن السياق" className="ar"></textarea>
              <button className="btn"><span className="en">Send inquiry</span><span className="ar">إرسال الاستفسار</span></button>
            </div>
          </div>
          <div id="credit-lines"></div>

          <div className="service-block reveal">
            <div className="snum">04.2</div>
            <div>
              <h3><span className="en">Supporting Studies &amp; M&amp;E Frameworks</span><span className="ar">دراسات داعمة وأطر متابعة وتقييم</span></h3>
              <p style={{ marginTop: 10 }}><span className="en">Business models, feasibility studies and monitoring &amp; evaluation frameworks across all four domains.</span><span className="ar">نماذج أعمال ودراسات جدوى وأطر متابعة وتقييم عبر المجالات الأربعة.</span></p>
              <ul className="deliv en"><li>Business model &amp; feasibility studies</li><li>Monitoring &amp; evaluation (M&amp;E) framework design</li><li>Baseline &amp; results-measurement studies</li></ul>
              <ul className="deliv ar"><li>نماذج أعمال ودراسات جدوى</li><li>تصميم أطر المتابعة والتقييم</li><li>دراسات خط الأساس وقياس النتائج</li></ul>
            </div>
            <div className="inquiry-mini">
              <h5><span className="en">Ask about this service</span><span className="ar">استفسر عن هذه الخدمة</span></h5>
              <input type="text" placeholder="Full name" className="en" /><input type="text" placeholder="الاسم الكامل" className="ar" />
              <input type="email" placeholder="Email" className="en" /><input type="email" placeholder="البريد الإلكتروني" className="ar" />
              <textarea placeholder="Brief context" className="en"></textarea><textarea placeholder="نبذة عن السياق" className="ar"></textarea>
              <button className="btn"><span className="en">Send inquiry</span><span className="ar">إرسال الاستفسار</span></button>
            </div>
          </div>
          <div id="studies"></div>
        </div>
      </section>

      <section className="band dark letterbox">
        <span className="matte-label en">enerQA / reel 03</span><span className="matte-label ar">إنيرقا / الحلقة 03</span>
        <span className="matte-scene">END SCENE</span>
        <div className="wrap" style={{ textAlign: 'center', padding: '20px 48px' }}>
          <span className="eyebrow" style={{ justifyContent: 'center' }}><span className="en">Not sure where to start?</span><span className="ar">لست متأكدًا من أين تبدأ؟</span></span>
          <h2><span className="en">Describe the challenge — we'll route it to the right domain lead.</span><span className="ar">صف التحدي — وسنوجّهه إلى المتخصص المناسب.</span></h2>
          <div className="hero-cta" style={{ justifyContent: 'center', marginTop: 28 }}>
            <Link href="/contact" className="btn on-dark"><span className="en">Start an inquiry</span><span className="ar">ابدأ استفسارًا</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}
