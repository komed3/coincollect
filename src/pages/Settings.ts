import type { Request, Response } from 'express';
import i18n from 'i18next';

import DB from '../services/DatabaseService';

const supportedCurrencies = [ 'CHF', 'EUR', 'GBP', 'JPY', 'USD' ];
const supportedLanguages = [ 'de-DE', 'en-US' ];

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
    const { action, currency, lang } = req.body;

    try {
        if ( action === 'save' ) {
            if ( currency && supportedCurrencies.includes( currency ) ) await DB.setCurrency( currency );

            if ( lang && supportedLanguages.includes( lang ) ) {
                res.cookie( 'locale', lang, { maxAge: 365 * 24 * 60 * 60 * 1000 } );
                await DB.setLanguage( lang );
                i18n.changeLanguage( lang );
            }

            res.redirect( '/settings?message=settingsSaved' );
            return;
        }

        if ( action === 'refresh' ) {
            await DB.updateDatabase();
            res.redirect( '/settings?message=dbUpdated' );
            return;
        }

        if ( action === 'clear' ) {
            if ( String( ( req.body as { confirmClear?: string } ).confirmClear ?? '' ).trim() !== 'CLEAR' ) {
                res.redirect( '/settings?message=confirmClear' );
                return;
            }

            await DB.clearDatabase();
            res.redirect( '/settings?message=dbCleared' );
            return;
        }

        if ( action === 'cleanup' ) {
            await DB.pruneUnusedImages();
            res.redirect( '/settings?message=imagesPruned' );
            return;
        }

        res.redirect( '/settings?message=unknownAction' );
    } catch ( err ) {
        res.status( 500 ).json( { msg: 'Failed to save settings', err } );
    }
};
