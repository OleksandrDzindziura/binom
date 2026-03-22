'use client';

import { useEffect } from 'react';
import '@/lib/i18n';
import { initClientLanguage, i18next } from '@/lib/i18n';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initClientLanguage();

    // Set initial lang attribute
    document.documentElement.lang = i18next.language;

    // Listen for language changes
    const handleLanguageChanged = (lng: string) => {
      document.documentElement.lang = lng;
    };

    i18next.on('languageChanged', handleLanguageChanged);

    return () => {
      i18next.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  return <>{children}</>;
}
