import type { Request, Response } from 'express';

export const baseEditor = async ( req: Request, res: Response ) : Promise< void > => {
    res.render( 'editor/base', { title: req.t( 'editor.base.title' ) } );
};

export const coinEditor = async ( req: Request, res: Response ) : Promise< void > => {
    res.render( 'editor/coin', { title: req.t( 'editor.coin.title' ) } );
};
