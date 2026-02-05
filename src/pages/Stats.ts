import type { Request, Response } from 'express';
import DB from '../services/DatabaseService';

export const stats = async ( req: Request, res: Response ) : Promise< void > => {
    res.render( 'stats', {
        title: req.t( 'stats.title' ),
        stats: await DB.getStats(),
        value: await DB.getValue()
    } );
};
