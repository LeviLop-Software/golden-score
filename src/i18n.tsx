'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import heTranslation from './locales/he/translation.json';

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      he: {
        translation: heTranslation,
      },
    },
    lng: 'he', // Default language
    fallbackLng: 'he', // Fallback language
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Disable suspense for Next.js compatibility
    },
  });

export default i18n;
