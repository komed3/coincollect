import type { Request, Response } from 'express';
import DB from '../services/DatabaseService';

export const stats = async ( req: Request, res: Response ) : Promise< void > => {
    res.render( 'stats', {
        page: 'stats',
        title: req.t( 'stats.title' ),
        value: DB.getValue(),
        stats: DB.getStats()
    } );
};
