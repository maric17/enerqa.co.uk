type IndustryTranslation = {
  title: string;
  description: string;
  introduction: string;
  lifecycle: string;
};

// Keep Arabic introductions alongside the existing industry routes, keyed by the shared CMS slug.
export const arabicIndustries: Readonly<Partial<Record<string, IndustryTranslation>>> = {
  'government-regulators-public-institutions': {
    title: 'الحكومة والجهات التنظيمية والمؤسسات العامة',
    description: 'سياسات المناخ والطاقة، وجرد غازات الدفيئة، وتنفيذ المساهمات المحددة وطنياً، والقياس والإبلاغ والتحقق للجهات العامة.',
    introduction: 'يبدأ العمل المناخي العام ببيانات موثوقة، ويستمر عندما تمتلك المؤسسات القدرة على التصرف بناءً عليها. وبالنسبة للوزارات والجهات التنظيمية والبلديات والسلطات العامة والمؤسسات المملوكة للدولة، ترتبط سياسات المناخ والطاقة وقوائم جرد غازات الدفيئة وتنفيذ المساهمات المحددة وطنياً وأنظمة القياس والإبلاغ والتحقق بالحوكمة البيئية ومنصات البيانات ومسارات المشاريع القابلة للاستثمار.\n\nوتساعد الترتيبات المؤسسية وبناء القدرات وحشد التمويل المناخي وتقييم البرامج على تحويل هذه الطموحات إلى تنفيذ مستدام.',
    lifecycle: 'تنطلق المشاريع العامة من حاجة واضحة تتعلق بسياسة أو خدمة، وتستند إلى البيانات ومشاركة أصحاب المصلحة. ويحدد تطوير المفهوم ودراسة الجدوى نطاق العمل المناسب ومتطلبات التمويل والترتيبات المؤسسية. ثم يحدّد التخطيط للمشتريات والتنفيذ مسار الإنجاز، بينما تساعد المتابعة والتقييم على قياس نتائج الاستثمار العام وتوجيه البرامج المستقبلية.',
  },
};

export function getArabicIndustry(slug: string) {
  return Object.hasOwn(arabicIndustries, slug) ? arabicIndustries[slug] : undefined;
}
