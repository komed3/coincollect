import type { Request, Response } from 'express';

export const editor = async ( req: Request, res: Response ) : Promise< void > => {
    res.render( 'editor', { title: req.t( 'editor.title' ) } );
};
