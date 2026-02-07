import type { Request, Response } from 'express';
import DB from '../services/DatabaseService';
import { CoinGrade, CoinMaterial, CoinShape, CoinStatus, CoinType } from '../types';

export const editor = async ( req: Request, res: Response ) : Promise< void > => {
    const coin = req.params.id ? await DB.getCoinById( req.params.id as string ) : undefined;
    res.render( 'editor', {
        title: req.t( 'editor.title' ),
        mode: coin ? 'edit' : 'add', coin,
        selectors: {
            grade: Object.values( CoinGrade ),
            material: Object.values( CoinMaterial ),
            shape: Object.values( CoinShape ),
            status: Object.values( CoinStatus ),
            type: Object.values( CoinType )
        }
    } );
};
