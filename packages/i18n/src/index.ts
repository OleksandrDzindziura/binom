import i18next from 'i18next';

// Ukrainian
import ukCommon from './locales/uk/common.json';
import ukCatalog from './locales/uk/portfolio.json';
import ukCalculator from './locales/uk/calculator.json';
import ukAdmin from './locales/uk/admin.json';
import ukContact from './locales/uk/contact.json';
import ukAbout from './locales/uk/about.json';
import ukFaq from './locales/uk/faq.json';
import ukLogin from './locales/uk/login.json';
import ukHomepage from './locales/uk/homepage.json';

export const resources = {
  uk: {
    common: ukCommon,
    catalog: ukCatalog,
    calculator: ukCalculator,
    admin: ukAdmin,
    contact: ukContact,
    about: ukAbout,
    faq: ukFaq,
    login: ukLogin,
    homepage: ukHomepage,
  },
} as const;

export const defaultNS = 'common';
export const supportedLanguages = ['uk'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export { i18next };
