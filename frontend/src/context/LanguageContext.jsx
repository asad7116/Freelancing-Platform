import React, { createContext, useContext, useState, useEffect } from 'react';

// Translation files
import en from '../locales/en.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import ar from '../locales/ar.json';
import de from '../locales/de.json';

const translations = {
  English: en,
  Spanish: es,
  French: fr,
  Arabic: ar,
  German: de,
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or default to English
    return localStorage.getItem('preferredLanguage') || 'English';
  });

  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    // Save language preference
    localStorage.setItem('preferredLanguage', language);
    
    // Set RTL for Arabic
    const rtl = language === 'Arabic';
    setIsRTL(rtl);
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = getLanguageCode(language);
  }, [language]);

  const getLanguageCode = (lang) => {
    const codes = {
      English: 'en',
      Spanish: 'es',
      French: 'fr',
      Arabic: 'ar',
      German: 'de',
    };
    return codes[lang] || 'en';
  };

  // Translation function
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language] || translations.English;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        // Fallback to English if translation not found
        value = translations.English;
        for (const fallbackKey of keys) {
          value = value?.[fallbackKey];
          if (value === undefined) break;
        }
        break;
      }
    }
    
    // If still not found, return the key itself
    if (typeof value !== 'string') {
      return key;
    }
    
    // Replace parameters like {name} with actual values
    return value.replace(/\{(\w+)\}/g, (_, param) => params[param] || `{${param}}`);
  };

  const changeLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
    }
  };

  const availableLanguages = Object.keys(translations);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      changeLanguage, 
      t, 
      isRTL, 
      availableLanguages,
      getLanguageCode 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
