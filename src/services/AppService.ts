import type { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import DB from './DatabaseService';

export const appService = async ( req: Request, res: Response, next: NextFunction ) : Promise< void > => {
    res.locals.lang = DB.getLanguage();
    res.locals.language = DB.getLanguage();
    res.locals.updatedAt = DB.getDateUpdatedAt();
    res.locals.currency = DB.getCurrency();
    res.locals.supportedLngs = [ 'de-DE', 'en-US' ];
    res.locals.translations = req.t( '_', { returnObjects: true } );
    res.locals.uuid = uuidv4;
    next();
};
