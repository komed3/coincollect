import type { NextFunction, Request, Response } from 'express';

export class Formatter {

    public static locale: string;

    public static number ( value: any, d: number = 2, opt: Intl.NumberFormatOptions = {} ) : string {
        return Intl.NumberFormat( Formatter.locale, { ...{
            notation: 'compact', minimumFractionDigits: d, maximumFractionDigits: d
        }, ...opt } ).format( value );
    }

    public static fullNumber ( value: any, d: number = 2, opt: Intl.NumberFormatOptions = {} ) {
        return Formatter.number( value, d, { notation: 'standard', ...opt } );
    }

    public static percent ( value: any, d: number = 1, opt: Intl.NumberFormatOptions = {} ) {
        return Formatter.number( value > 1 ? value / 100 : value, d, { style: 'percent', ...opt } );
    }

    public static money ( currency: string, value: any, d: number = 2, opt: Intl.NumberFormatOptions = {} ) {
        return Formatter.number( value, d, { style: 'currency', currency, ...opt } );
    }

    public static unit ( unit: string, value: any, d: number = 2, opt: Intl.NumberFormatOptions = {} ) {
        return Formatter.number( value, d, { style: 'unit', unit, unitDisplay: 'short', ...opt } );
    }

    public static date ( value: Date | string | number, opt: Intl.DateTimeFormatOptions = {} ) {
        return new Intl.DateTimeFormat( Formatter.locale, { ...{
            year: 'numeric', month: 'short', day: 'numeric'
        }, ...opt } ).format( new Date( value ) );
    }

}

export const formatterService = ( req: Request, res: Response, next: NextFunction ) : void => {
    Formatter.locale = req.language || 'en-US';
    res.locals.formatter = Formatter;
    next();
};
