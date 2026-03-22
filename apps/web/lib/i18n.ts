'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from '@repo/i18n';

if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    resources,
    lng: 'uk',
    fallbackLng: 'uk',
    defaultNS: 'common',
    interpolation: { escapeValue: false },
  });
}

export function initClientLanguage() {
  if (i18next.language !== 'uk') {
    i18next.changeLanguage('uk');
  }
}

export { i18next };
