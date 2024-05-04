import i18n from 'i18next';

import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from 'src/locales/en.json';
import roTranslation from 'src/locales/ro.json';
import ruTranslation from 'src/locales/ru.json';

// async function run() {
// const Backend = await import('i18next-http-backend');

i18n

// Enables the i18next backend
// .use(Backend)

  // Enable automatic language detection
  .use(LanguageDetector)

  // Enables the hook initialization module
  .use(initReactI18next)
  .init({
    resources: {
      ro: { translation: roTranslation },
      en: { translation: enTranslation },
      ru: { translation: ruTranslation },
    },
    lng: 'ro',
    fallbackLng: 'ro',
    debug: false,
    keySeparator: false,
    react: {
      useSuspense: false,
    },
    interpolation: {
      escapeValue: false,
      formatSeparator: ',',
    },
  });

// }

export default i18n;
