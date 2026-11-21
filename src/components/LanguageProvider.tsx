'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { SiteLanguage } from '@/lib/i18n/site';

const SiteLanguageContext = createContext<SiteLanguage>('en');
const LanguageNoticeContext = createContext<{
  requestLanguage: (language: SiteLanguage) => void;
  arabicNoticeOpen: boolean;
  dismissArabicNotice: () => void;
} | null>(null);

export function LanguageProvider({ children, language = 'en' }: { children: ReactNode; language?: SiteLanguage }) {
  const [arabicNoticeOpen, setArabicNoticeOpen] = useState(false);

  // The route sets the language. Only the unavailable-page button needs state.
  const requestLanguage = useCallback((requested: SiteLanguage) => {
    setArabicNoticeOpen(requested === 'ar' && language === 'en');
  }, [language]);
  const dismissArabicNotice = useCallback(() => setArabicNoticeOpen(false), []);

  return (
    <SiteLanguageContext.Provider value={language}>
      <LanguageNoticeContext.Provider value={{ requestLanguage, arabicNoticeOpen, dismissArabicNotice }}>
        {children}
      </LanguageNoticeContext.Provider>
    </SiteLanguageContext.Provider>
  );
}

export function useSiteLanguage() {
  return useContext(SiteLanguageContext);
}

export function useLanguage() {
  const context = useContext(LanguageNoticeContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}
