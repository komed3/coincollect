import type { NextFunction, Request, Response } from 'express';

export class Formatter {

    public static locale: string;

    public static number ( value: any, d: number = 2, opt = {} ) : string {
        return Intl.NumberFormat( Formatter.locale, { ...{
            notation: 'compact', minimumFractionDigits: d, maximumFractionDigits: d
        }, ...opt } ).format( value );
    }

}

export const formatterService = ( req: Request, res: Response, next: NextFunction ) : void => {
    Formatter.locale = req.language || 'en-US';
    res.locals.formatter = Formatter;
    next();
};
