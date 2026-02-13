import type { Request, Response } from 'express';
import { CoinType } from '../types';

export const baseEditor = async ( req: Request, res: Response ) : Promise< void > => {
    res.render( 'editor/base', {
        title: req.t( 'editor.base.title' ),
        keys: {
            type: CoinType
        }
    } );
};

export const coinEditor = async ( req: Request, res: Response ) : Promise< void > => {
    res.render( 'editor/coin', { title: req.t( 'editor.coin.title' ) } );
};
