import type { Request, Response } from 'express';

export const settings = async ( req: Request, res: Response ) : Promise< void > => {
    res.render( 'settings', { title: req.t( 'settings.title' ) } );
};
