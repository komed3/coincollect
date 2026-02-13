import type { Request, Response } from 'express';

export const dashboard = async ( req: Request, res: Response ) : Promise< void > => {
    res.render( 'dashboard', {
        page: 'dashboard',
        title: req.t( 'dashboard.title' )
    } );
};
