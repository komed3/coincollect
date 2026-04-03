import type { Request, Response } from 'express';
import DB from '../services/DatabaseService';

const supportedCurrencies = [ 'CHF', 'EUR', 'GBP', 'JPY', 'USD' ] as const;
type Language = ( typeof supportedLanguages )[ number ];

const supportedLanguages = [ 'de-DE', 'en-US' ] as const;
type Currency = ( typeof supportedCurrencies )[ number ];

export const settings = async ( req: Request, res: Response ) : Promise< void > => {
    const message = String( req.query.message ?? '' );
    const unusedImages = await DB.getUnusedImages();
    const coinCount = DB.getAllSingleCoins().length;
    const baseCount = DB.getAllCoinBases().length;

    res.render( 'settings', {
        page: 'settings',
        title: req.t( 'settings.title' ),
        message,
        baseCount,
        coinCount,
        unusedImages,
        currency: DB.getCurrency(),
        language: DB.getLanguage(),
        supportedCurrencies,
        supportedLanguages
    } );
};

export const saveSettings = async ( req: Request, res: Response ) : Promise< void > => {
    try {
        const { action, currency, language } = req.body as {
            action?: string, currency?: string, language?: string
        };

        if ( action === 'save' ) {
            if ( currency && supportedCurrencies.includes( currency as Currency ) ) await DB.setCurrency( currency );

            if ( language && supportedLanguages.includes( language as Language ) ) {
                await DB.setLanguage( language as Language );
                res.cookie( 'locale', language, { sameSite: 'strict', secure: false } );
            }

            res.redirect( '/settings?message=' + encodeURIComponent( req.t( 'settings.saved' ) ) );
            return;
        }

        if ( action === 'refresh' ) {
            await DB.updateDatabase();
            res.redirect( '/settings?message=' + encodeURIComponent( req.t( 'settings.dbUpdated' ) ) );
            return;
        }

        if ( action === 'clear' ) {
            const confirm = String( ( req.body as { confirmClear?: string } ).confirmClear ?? '' ).trim();
            if ( confirm !== 'CLEAR' ) {
                res.redirect( '/settings?message=' + encodeURIComponent( req.t( 'settings.confirmClear' ) ) );
                return;
            }

            await DB.clearDatabase();
            res.redirect( '/settings?message=' + encodeURIComponent( req.t( 'settings.dbCleared' ) ) );
            return;
        }

        if ( action === 'cleanup' ) {
            const deleted = await DB.pruneUnusedImages();
            res.redirect( '/settings?message=' + encodeURIComponent( req.t( 'settings.imagesPruned', { count: deleted.length } ) ) );
            return;
        }

        res.redirect( '/settings?message=' + encodeURIComponent( req.t( 'settings.unknownAction' ) ) );
    } catch ( error ) {
        res.status( 500 ).send( `${ req.t( 'settings.error' ) }: ${ ( error as Error ).message }` );
    }
};
