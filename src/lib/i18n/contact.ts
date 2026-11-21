// Keyed by the existing form copy so storage and validation stay shared.
const arabic: Readonly<Record<string, string>> = {
  'required': 'مطلوب',
  'optional': 'اختياري',
  'Name': 'الاسم',
  'Email': 'البريد الإلكتروني',
  'Organisation': 'المؤسسة',
  'Enquiry Type': 'نوع الاستفسار',
  'Project Discussion': 'مناقشة مشروع',
  'Tool Access': 'الوصول إلى أداة',
  'General Enquiry': 'استفسار عام',
  'Tool': 'الأداة',
  'Domain': 'المجال',
  'Industry': 'القطاع',
  'Not specified': 'غير محدد',
  'Project Location': 'موقع المشروع',
  'Current Stage': 'المرحلة الحالية',
  'Message': 'الرسالة',
  'Send Your Enquiry': 'أرسل استفسارك',
  'Receive new Enerqa publications and selected updates': 'تلقي منشورات إنيرقا الجديدة وتحديثات مختارة',
  'We will use the information you provide to respond to your enquiry.': 'سنستخدم المعلومات التي تقدمها للرد على استفسارك.',
  'Read our Privacy Notice.': 'اقرأ إشعار الخصوصية (بالإنجليزية).',
  'Send Enquiry': 'إرسال الاستفسار',
  'Sending your enquiry.': 'جارٍ إرسال استفسارك.',
  'Thank you. Your enquiry has been received.': 'شكراً لك. لقد تلقينا استفسارك.',
  'Send another enquiry': 'أرسل استفساراً آخر',
  'We could not send your enquiry. Please try again or email': 'تعذّر إرسال استفسارك. حاول مرة أخرى أو راسلنا على',
  'Please correct the fields marked below.': 'يرجى تصحيح الحقول المشار إليها أدناه.',
  'Leave this field empty': 'اترك هذا الحقل فارغاً',
  'Please enter your name.': 'يرجى إدخال اسمك.',
  'Please enter a valid email address.': 'يرجى إدخال عنوان بريد إلكتروني صالح.',
  'Please choose an enquiry type.': 'يرجى اختيار نوع الاستفسار.',
  'Please enter a message.': 'يرجى إدخال رسالة.',
  'Please keep this under 200 characters.': 'يرجى ألا يتجاوز هذا الحقل ٢٠٠ حرف.',
  'Please keep your message under 5,000 characters.': 'يرجى ألا تتجاوز رسالتك ٥٬٠٠٠ حرف.',
  'Please choose a domain from the list.': 'يرجى اختيار مجال من القائمة.',
  'Please choose an industry from the list.': 'يرجى اختيار قطاع من القائمة.',
  'Please choose a tool from the list.': 'يرجى اختيار أداة من القائمة.',
  'Your enquiry is saved, but we could not save your newsletter subscription. Please use the newsletter form to try again.': 'تم حفظ استفسارك، لكن تعذّر حفظ اشتراكك في النشرة. يرجى المحاولة مجدداً عبر نموذج الاشتراك.',
};

export type ContactLanguage = 'en' | 'ar';

export function contactText(language: ContactLanguage, text: string) {
  return language === 'ar' ? (arabic[text] ?? text) : text;
}
