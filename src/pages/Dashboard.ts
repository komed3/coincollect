import type { Request, Response } from 'express';

export const dashboard = async ( req: Request, res: Response ) : Promise< void > => {
    res.render( 'home', { title: req.t( 'home.title' ) } );
};
