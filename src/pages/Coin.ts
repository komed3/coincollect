import type { Request, Response } from 'express';

export const coin = async ( req: Request, res: Response ) : Promise< void > => {
    res.render( 'coin', { title: req.t( 'coin.title' ) } );
};
