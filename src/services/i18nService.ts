import { join } from 'node:path';
import i18next from 'i18next';
import I18NexFsBackend from 'i18next-fs-backend';
import { LanguageDetector, handle } from 'i18next-http-middleware';

await i18next.use( I18NexFsBackend ).use( LanguageDetector ).init( {
    fallbackLng: 'en-US',
    preload: [ 'en-US', 'de-DE' ],
    supportedLngs: [ 'en-US', 'de-DE' ],
    cleanCode: true,
    saveMissing: false,
    debug: false,
    backend: {
        loadPath: join( process.cwd(), 'locales/{{lng}}.json' ),
    },
    detection: {
        order: [ 'cookie', 'header' ],
        lookupCookie: 'locale',
        caches: [ 'cookie' ],
        cookieSameSite: 'strict',
        cookieSecure: false
    },
    interpolation: {
        escapeValue: false
    }
} );

export const I18nService = handle( i18next );
