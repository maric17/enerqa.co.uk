'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'ar';

const STORAGE_KEY = 'enerqa-lang';

// p. 8: "Language switching should retain the equivalent page where a
// translation exists; otherwise explain availability". p. 227: bilingual
// equivalents need an accurate Arabic translation first. No page has one yet,
// so choosing AR keeps the visitor on the English page and shows a notice.
// Flipping <html lang="ar" dir="rtl"> over English text mislabelled it for
// screen readers, blanked every `span.en`-only heading and mirrored the layout.
// Set this to true once real Arabic pages are published.
const ARABIC_AVAILABLE = false;

// Write the active language to BOTH places the app reads it from:
//  - <html lang/dir> for browsers, screen readers and text direction
//  - <body data-lang> because style.css keys every bilingual rule off
//    `body[data-lang="en"] .ar { display:none }`.
function applyLanguage(lang: Language) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.body.dataset.lang = lang;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  /** True after a visitor asked for Arabic while no Arabic page exists. */
  arabicNoticeOpen: boolean;
  dismissArabicNotice: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [arabicNoticeOpen, setArabicNoticeOpen] = useState(false);

  useEffect(() => {
    // Storage can throw (private mode, blocked site data) - English is the safe default.
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'ar' && ARABIC_AVAILABLE) {
        setLanguageState('ar');
        applyLanguage('ar');
      } else if (stored === 'ar') {
        // A visitor who picked AR under the old switch would otherwise keep
        // getting mirrored English pages.
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* keep English */
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    if (lang === 'ar' && !ARABIC_AVAILABLE) {
      setArabicNoticeOpen(true);
      return;
    }
    setArabicNoticeOpen(false);
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* the choice still applies to this visit */
    }
    applyLanguage(lang);
  }, []);

  const dismissArabicNotice = useCallback(() => setArabicNoticeOpen(false), []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, arabicNoticeOpen, dismissArabicNotice }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
