'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'ar';

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
    if (storedLang) {
      setLanguage(storedLang);
      document.body.setAttribute('data-lang', storedLang);
      document.body.dir = storedLang === 'ar' ? 'rtl' : 'ltr';
    } else {
      document.body.setAttribute('data-lang', 'en');
      document.body.dir = 'ltr';
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('enerqa-lang', lang);
    document.body.setAttribute('data-lang', lang);
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
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
