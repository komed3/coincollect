import type { Request, Response } from 'express';

export const stats = async ( req: Request, res: Response ) : Promise< void > => {
    res.render( 'stats', { title: req.t( 'stats.title' ) } );
};
