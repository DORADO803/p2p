import React, { createContext, useState, ReactNode, useContext, useCallback } from 'react';

// Static imports for simplicity in this environment
import enMessages from '../locales/en.ts';
import esMessages from '../locales/es.ts';

const translations = {
  en: enMessages,
  es: esMessages,
};

export type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getInitialLanguage = (): Language => {
  const savedLang = localStorage.getItem('p2p-lang');
  if (savedLang === 'en' || savedLang === 'es') {
    return savedLang;
  }
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'es' ? 'es' : 'en';
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('p2p-lang', lang);
    setLanguageState(lang);
  };

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const messages = translations[language];
    let translation = messages[key as keyof typeof messages] || key;
    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }
    return translation;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
