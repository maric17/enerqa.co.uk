'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'ar';

// Write the active language to BOTH places the app reads it from:
//  - <html lang/dir> for browsers, screen readers and text direction
//  - <body data-lang> because style.css keys every bilingual rule off
//    `body[data-lang="en"] .ar { display:none }`. Without the body
//    attribute that selector never matches, `.ar` falls back to its
//    default `display:inline-block`, and the header renders English and
//    Arabic side by side.
function applyLanguage(lang: Language) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.body.dataset.lang = lang;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Check local storage or default to 'en'
    const storedLang = localStorage.getItem('enerqa-lang') as Language;
    const initial: Language = storedLang === 'ar' || storedLang === 'en' ? storedLang : 'en';
    setLanguage(initial);
    applyLanguage(initial);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('enerqa-lang', lang);
    applyLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
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
