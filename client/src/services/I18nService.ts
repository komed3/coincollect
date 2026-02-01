import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

i18n
    .use( Backend )
    .use( LanguageDetector )
    .use( initReactI18next )
    .init( {
        fallbackLng: 'de',
        debug: false,
        interpolation: {
            escapeValue: false
        },
        backend: {
            loadPath: '/locales/{{lng}}/translation.json'
        },
        detection: {
            order: [ 'localStorage', 'navigator' ],
            caches: [ 'localStorage' ]
        }
    } );

export default i18n;
