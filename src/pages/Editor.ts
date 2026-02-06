import type { Request, Response } from 'express';
import DB from '../services/DatabaseService';
import { CoinGrade, CoinShape, CoinStatus, CoinType } from '../types';

export const editor = async ( req: Request, res: Response ) : Promise< void > => {
    const coin = req.params.id ? await DB.getCoinById( req.params.id as string ) : undefined;
    res.render( 'editor', {
        title: req.t( 'editor.title' ),
        mode: coin ? 'edit' : 'add', coin,
        selectors: {
            type: Object.values( CoinType ),
            grade: Object.values( CoinGrade ),
            status: Object.values( CoinStatus ),
            shape: Object.values( CoinShape )
        }
    } );
};
