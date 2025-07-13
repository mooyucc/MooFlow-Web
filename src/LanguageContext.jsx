import React, { createContext, useContext, useState, useMemo } from 'react';
import zh from './locales/zh';
import en from './locales/en';

const LanguageContext = createContext();

const resources = { zh, en };

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('zh');
  const value = useMemo(() => ({
    lang,
    setLang,
    t: (key, params) => {
      let str = resources[lang][key] || key;
      if (params && typeof str === 'string') {
        Object.keys(params).forEach(k => {
          str = str.replace(new RegExp('{' + k + '}', 'g'), params[k]);
        });
      }
      return str;
    },
  }), [lang]);
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  return [ctx.t, ctx.lang, ctx.setLang];
} 