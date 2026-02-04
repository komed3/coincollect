import type { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const appService = ( req: Request, res: Response, next: NextFunction ) : void => {
    res.locals.lang = req.language;
    res.locals.uuid = uuidv4;
    next();
};
