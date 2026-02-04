import type { NextFunction, Request, Response } from 'express';
import type { TFunction } from 'i18next';

export class Formatter {

    public static locale: string;

    public static number ( value: any, d: number = 2, opt: Intl.NumberFormatOptions = {} ) : string {
        return Intl.NumberFormat( Formatter.locale, { ...{
            notation: 'compact', minimumFractionDigits: d, maximumFractionDigits: d
        }, ...opt } ).format( value );
    }

    public static fullNumber ( value: any, d: number = 2, opt: Intl.NumberFormatOptions = {} ) : string {
        return Formatter.number( value, d, { notation: 'standard', ...opt } );
    }

    public static percent ( value: any, d: number = 1, opt: Intl.NumberFormatOptions = {} ) : string {
        return Formatter.number( value > 1 ? value / 100 : value, d, { style: 'percent', ...opt } );
    }

    public static money ( currency: string, value: any, d: number = 2, opt: Intl.NumberFormatOptions = {} ) : string {
        return Formatter.number( value, d, { style: 'currency', currency, ...opt } );
    }

    public static unit ( unit: string, value: any, d: number = 2, opt: Intl.NumberFormatOptions = {} ) : string {
        return Formatter.number( value, d, { style: 'unit', unit, unitDisplay: 'short', ...opt } );
    }

    public static date ( value: Date | string | number, opt: Intl.DateTimeFormatOptions = {} ) : string {
        return new Intl.DateTimeFormat( Formatter.locale, { ...{
            year: 'numeric', month: 'short', day: 'numeric'
        }, ...opt } ).format( new Date( value ) );
    }

    public static dateDiff ( value: Date | string | number, t: TFunction ) : string {
        const units = [ 'second', 'minute', 'hour', 'day', 'month', 'year' ];
        const thresholds = [ 60, 3600, 86400, 2592000, 31104000 ];

        const seconds = Math.floor( ( Date.now() - new Date( value ).getTime() ) / 1000 );
        const index = thresholds.findIndex( th => seconds < th );
        const count = index === -1 ? Math.floor( seconds / 31104000 ) : Math.floor( seconds / ( thresholds[ index - 1 ] || 1 ) );

        return t( `_.diff.${ units[ index === -1 ? 5 : index ] }`, { count } );
    }

}

export const formatterService = ( req: Request, res: Response, next: NextFunction ) : void => {
    Formatter.locale = req.language || 'en-US';
    res.locals.formatter = Formatter;
    next();
};
