import type { Request, Response } from 'express';
import DB from '../services/DatabaseService';

export const coin = async ( req: Request, res: Response ) : Promise< void > => {
    const { id } = req.params;
    const coin = await DB.getCoinById( id as string );

    if ( ! coin ) res.redirect( '/404' );
    else res.render( 'coin', { title: req.t( 'coin.title', { name: coin.name } ), coin } );
};
