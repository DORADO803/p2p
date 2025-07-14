import React from 'react';
import { useLanguage, Language } from '../context/LanguageContext';

export const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
  ];

  return (
    <div className="absolute top-4 right-4 z-50">
      <div className="relative">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="bg-brand-secondary text-brand-light border border-slate-600 rounded-md py-2 pl-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer"
          aria-label={t('languageSelector')}
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
    </div>
  );
};
