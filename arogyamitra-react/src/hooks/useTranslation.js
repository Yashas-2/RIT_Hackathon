import { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageProvider';
import translations from '../utils/translations';

// Custom hook for handling translations
const useTranslation = () => {
  const { language, changeLanguage } = useLanguage();

  // Function to get translated text

  // Function to get translated text
  const t = (key) => {
    // Ensure we have a valid language
    const currentLang = language || 'kn';
    
    if (translations[currentLang] && translations[currentLang][key]) {
      return translations[currentLang][key];
    }
    // Fallback to English if translation not found
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    // Fallback to key itself if not found in any language
    return key;
  };

  return {
    language,
    changeLanguage,
    t
  };
};

export default useTranslation;