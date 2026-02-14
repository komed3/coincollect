import type { Request, Response } from 'express';
import DB from './DatabaseService';

export class CoinService {

    private readonly dbService = DB;

    private async catch ( res: Response, msg: string, fn: () => Promise< void > ) : Promise< void > {
        try { await fn() } catch ( err ) { res.status( 500 ).json( { msg, err } ) }
    }

    public async addCoinBase ( req: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to add coin base', async () => {
            const coin = await this.dbService.addCoinBase( req.body );
            res.status( 201 ).json( coin );
        } );
    }

}
