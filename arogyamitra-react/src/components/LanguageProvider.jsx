import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('kn'); // Default to Kannada

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'kn';
    setLanguage(savedLanguage);
  }, []);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    // Keep custom event for any non-react listeners if they exist
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: newLanguage }));
  };

  const value = {
    language,
    changeLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
