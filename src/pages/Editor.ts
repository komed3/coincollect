import type { Request, Response } from 'express';

import { DatabaseService } from '../services/DatabaseService';
import { Acquisition, CoinGrade, CoinMaterial, CoinShape, CoinStatus, CoinType } from '../types';

export const baseEditor = async ( req: Request, res: Response ) : Promise< void > => {
    res.render( 'editor/base', {
        title: req.t( 'editor.base.title' ),
        keys: {
            type: CoinType,
            material: CoinMaterial,
            shape: CoinShape
        }
    } );
};

export const coinEditor = async ( req: Request, res: Response ) : Promise< void > => {
    const DB = DatabaseService.getInstance();
    await DB.init();

    res.render( 'editor/coin', {
        title: req.t( 'editor.coin.title' ),
        coinBases: DB.getAllCoinBases(),
        keys: {
            status: CoinStatus,
            grade: CoinGrade,
            acquisition: Acquisition
        }
    } );
};
