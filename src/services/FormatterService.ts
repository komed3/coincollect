import type { NextFunction, Request, Response } from 'express';

export class FormatterService {

    public static locale: string;

    public static number ( value: any, d: number = 2, opt = {} ) : string {
        return Intl.NumberFormat( FormatterService.locale, { ...{
            notation: 'compact', minimumFractionDigits: d, maximumFractionDigits: d
        }, ...opt } ).format( value );
    }

}

export const formatter = ( req: Request, res: Response, next: NextFunction ) : void => {
    FormatterService.locale = req.language || 'en-US';
    res.locals.formatter = FormatterService;
    next();
};
