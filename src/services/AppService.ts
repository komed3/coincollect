import type { NextFunction, Request, Response } from 'express';
import i18next from 'i18next';
import { v4 as uuidv4 } from 'uuid';

import DB from './DatabaseService';

export const appService = async ( req: Request, res: Response, next: NextFunction ) : Promise< void > => {
    const lang = DB.getLanguage();
    i18next.changeLanguage( lang );

    res.locals.lang = lang;
    res.locals.language = lang;
    res.locals.updatedAt = DB.getDateUpdatedAt();
    res.locals.currency = DB.getCurrency();
    res.locals.supportedLngs = [ 'de-DE', 'en-US' ];
    res.locals.translations = req.t( '_', { returnObjects: true } );
    res.locals.uuid = uuidv4;
    next();
};
