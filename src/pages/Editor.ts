import type { Request, Response } from 'express';

import DB from '../services/DatabaseService';
import { Acquisition, CoinGrade, CoinMaterial, CoinShape, CoinStatus, CoinType } from '../types';

export const baseEditor = async ( req: Request, res: Response ) : Promise< void > => {
    const coin = req.params.id ? DB.getCoinBase( req.params.id as string ) : undefined;
    res.render( 'editor/base', {
        page: 'editor',
        title: req.t( 'editor.base.title' ),
        mode: coin ? 'edit' : 'add', coin,
        suggestions: DB.getAllSuggestions(),
        keys: {
            type: CoinType,
            material: CoinMaterial,
            shape: CoinShape
        }
    } );
};

export const coinEditor = async ( req: Request, res: Response ) : Promise< void > => {
    res.render( 'editor/coin', {
        page: 'editor',
        title: req.t( 'editor.coin.title' ),
        coinBases: DB.getAllCoinBases(),
        suggestions: DB.getAllSuggestions(),
        keys: {
            status: CoinStatus,
            grade: CoinGrade,
            acquisition: Acquisition
        }
    } );
};
