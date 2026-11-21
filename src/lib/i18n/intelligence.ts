import countries from './intelligence-countries-ar.json';
import { siteText, type SiteLanguage } from './site';

const arabic: Readonly<Record<string, string>> = {
  'Open-access news, research, official updates and corporate disclosures on climate, energy, environment and sustainable business.': 'أخبار وبحوث ومستجدات رسمية وإفصاحات شركات متاحة للقراءة مجاناً في مجالات المناخ والطاقة والبيئة والأعمال المستدامة.',
  'Explore open-access news, research and official updates from around the world. Every result links to complete reading available free of charge without a subscription or sign-in. These external records are distinct from Enerqa-authored publications.': 'استكشف الأخبار والبحوث والمستجدات الرسمية المتاحة للجميع من أنحاء العالم. تقودك كل نتيجة إلى النص الكامل مجاناً ودون اشتراك أو تسجيل دخول. ويقدّم هذا القسم مواد من مصادر خارجية تُعرض بلغتها الأصلية، بينما تجد أعمال إنيرقا في قسم المنشورات.',
  "Content belongs to its original publishers. Free reading does not grant republication rights for articles or images. APITube's evaluation feed is delayed by at least 12 hours.": 'يعود المحتوى إلى ناشريه الأصليين. وتبقى حقوق إعادة نشر المقالات والصور محفوظة عند إتاحتها للقراءة المجانية. ويتأخر موجز APITube التجريبي 12 ساعة على الأقل.',
  'Sources': 'المصادر',
  'Sources, attribution and methodology': 'المصادر ونسب المحتوى والمنهجية',
  'Related Enerqa content': 'محتوى ذو صلة من إنيرقا',
  'Filter results': 'تصفية النتائج',
  'Show filters': 'إظهار عوامل التصفية',
  'Hide filters': 'إخفاء عوامل التصفية',
  'Search Global Intelligence': 'ابحث في المستجدات العالمية',
  'Search a keyword or topic': 'ابحث بكلمة مفتاحية أو موضوع',
  'Select any options, then apply filters. Options in the same group match any selection. Different groups must all match.': 'حدّد الخيارات التي تريدها ثم طبّق عوامل التصفية. يكفي تطابق خيار واحد داخل المجموعة، ويجب أن تتطابق جميع المجموعات التي اخترت منها.',
  'Conflicting country or region selections were cleared.': 'أُزيلت خيارات البلدان أو المناطق التي تتعارض مع اختيارك.',
  'Geography updated. Country selections also set their parent region and continent.': 'حُدّث النطاق الجغرافي. يؤدي اختيار بلد أيضاً إلى تحديد منطقته وقارته.',
  'No options available.': 'لا توجد خيارات متاحة.',
  'Topic': 'الموضوع',
  'Domain': 'المجال',
  'Industry': 'القطاع',
  'Continent': 'القارة',
  'Region': 'المنطقة',
  'Country': 'البلد',
  'Content Type': 'نوع المحتوى',
  'Date Range': 'الفترة الزمنية',
  'Past 24 hours': 'آخر 24 ساعة',
  'Past 7 days': 'آخر 7 أيام',
  'Past 30 days': 'آخر 30 يوماً',
  'Additional filters': 'عوامل تصفية إضافية',
  'Apply filters': 'تطبيق عوامل التصفية',
  'Clear All': 'مسح الكل',
  'Filters changed. Click Apply filters to update results.': 'تغيّرت عوامل التصفية. اضغط على «تطبيق عوامل التصفية» لتحديث النتائج.',
  'Results': 'النتائج',
  'Updating results…': 'جارٍ تحديث النتائج…',
  'Updated from sources': 'محدّثة من المصادر',
  'Saved collection': 'النتائج المحفوظة',
  'Sources could not be refreshed. Showing saved results where available.': 'تعذّر تحديث المصادر. تُعرض النتائج المحفوظة حيثما تتوفر.',
  'Some sources could not be refreshed. Saved results remain available.': 'تعذّر تحديث بعض المصادر. لا تزال النتائج المحفوظة متاحة.',
  'Sources are temporarily unavailable. Please try again later.': 'المصادر غير متاحة مؤقتاً. يُرجى المحاولة لاحقاً.',
  'No open-access results match these filters.': 'لا توجد نتائج متاحة للقراءة مجاناً تطابق عوامل التصفية.',
  'News': 'أخبار',
  'Policy and Official Updates': 'السياسات والمستجدات الرسمية',
  'Corporate Disclosures': 'إفصاحات الشركات',
  'Issuer': 'جهة الإصدار',
  'Filed': 'تاريخ الإيداع',
  'Published': 'تاريخ النشر',
  'Date not supplied': 'التاريخ غير متاح',
  'Retrieved': 'تاريخ الاسترجاع',
  'Details and coverage': 'التفاصيل والنطاق الجغرافي',
  'Authors:': 'المؤلفون:',
  'Showing the latest cached release; the source could not be refreshed.': 'تُعرض أحدث نسخة محفوظة بسبب تعذّر تحديث المصدر.',
  'Read Full Article': 'اقرأ المقال كاملاً',
  'Read Full Paper': 'اقرأ البحث كاملاً',
  'Read Full Report': 'اقرأ التقرير كاملاً',
  'Read Filing': 'اقرأ الإفصاح',
  'Results pages': 'صفحات النتائج',
  'Previous page': 'الصفحة السابقة',
  'Next page': 'الصفحة التالية',
  'Climate': 'المناخ',
  'Energy': 'الطاقة',
  'Environment and Nature': 'البيئة والطبيعة',
  'Business and Finance': 'الأعمال والتمويل',
  'Africa': 'أفريقيا',
  'Americas': 'الأمريكتان',
  'Antarctica': 'القارة القطبية الجنوبية',
  'Asia': 'آسيا',
  'Europe': 'أوروبا',
  'Oceania': 'أوقيانوسيا',
  'Australia and New Zealand': 'أستراليا ونيوزيلندا',
  'Caribbean': 'الكاريبي',
  'Central America': 'أمريكا الوسطى',
  'Central Asia': 'آسيا الوسطى',
  'Eastern Africa': 'شرق أفريقيا',
  'Eastern Asia': 'شرق آسيا',
  'Eastern Europe': 'شرق أوروبا',
  'Melanesia': 'ميلانيزيا',
  'Micronesia': 'ميكرونيزيا',
  'Middle Africa': 'وسط أفريقيا',
  'Northern Africa': 'شمال أفريقيا',
  'Northern America': 'أمريكا الشمالية',
  'Northern Europe': 'شمال أوروبا',
  'Polynesia': 'بولينيزيا',
  'South America': 'أمريكا الجنوبية',
  'South-eastern Asia': 'جنوب شرق آسيا',
  'Southern Africa': 'جنوب أفريقيا',
  'Southern Asia': 'جنوب آسيا',
  'Southern Europe': 'جنوب أوروبا',
  'Western Africa': 'غرب أفريقيا',
  'Western Asia': 'غرب آسيا',
  'Western Europe': 'غرب أوروبا',
  'Global': 'عالمي',
  'Multiple Regions': 'مناطق متعددة',
  'Not Specified': 'غير محدد',
  'Not specified': 'غير محدد',
};

export const FILTER_LABELS: Readonly<Record<string, string>> = {
  q: 'Search', theme: 'Topic', domain: 'Domain', industry: 'Industry',
  continent: 'Continent', region: 'Region', country: 'Country',
  type: 'Content Type', language: 'Language', dateRange: 'Date Range',
};

export const DATE_RANGES = [
  { value: '24h', label: 'Past 24 hours' },
  { value: '7d', label: 'Past 7 days' },
  { value: '30d', label: 'Past 30 days' },
];

export function intelligenceText(language: SiteLanguage, text: string) {
  if (language === 'ar' && Object.hasOwn(arabic, text)) return arabic[text];
  return siteText(language, text);
}

// The registry's ISO alpha-3 keys remain the stored filter values.
const countryNames: Readonly<Partial<Record<string, string>>> = countries;
export function intelligenceCountry(language: SiteLanguage, code: string, name: string) {
  return language === 'ar' && Object.hasOwn(countryNames, code) ? countryNames[code] ?? name : name;
}

const arabicLanguages = new Intl.DisplayNames('ar-QA', { type: 'language', fallback: 'none' });
export function intelligenceLanguage(language: SiteLanguage, code: string) {
  if (code === 'unspecified') return intelligenceText(language, 'Not specified');
  // Provider language values can be absent or contain a nonstandard code.
  if (language === 'ar' && /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(code)) {
    try { return arabicLanguages.of(code) ?? code.toUpperCase(); }
    catch { return code.toUpperCase(); }
  }
  return code.toUpperCase();
}
