import type { Request, Response } from 'express';
import DB from '../services/DatabaseService';

export const baseView = async ( req: Request, res: Response ) : Promise< void > => {
    const coin = req.params.id ? DB.getCoinBase( req.params.id as string ) : undefined;

    if ( ! coin ) { res.redirect( '/404' ) } else {
        res.render( 'view/base', {
            title: req.t( 'view.base.title', { name: coin.name, id: coin.id } ),
            coin
        } );
    }
};

export const coinView = async ( req: Request, res: Response ) : Promise< void > => {
    const coin = req.params.id ? DB.getSingleCoin( req.params.id as string ) : undefined;

    if ( ! coin ) { res.redirect( '/404' ) } else {
        const base = DB.getCoinBase( coin.baseId )!;
        res.render( 'view/coin', {
            title: req.t( 'view.coin.title', { name: base.name, id: coin.id, baseId: base.id } ),
            base, coin
        } );
    }
};
