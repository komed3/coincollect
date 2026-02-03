import type { Request, Response } from 'express';

export const home = async ( req: Request, res: Response ) : Promise< void > => {
    res.render( 'home' );
};