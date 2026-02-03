import type { Request, Response } from 'express';
import DB from '../services/DatabaseService';

export class CoinController {

    private readonly dbService = DB;

    constructor () {}

    public async getAllCoins ( _: Request, res: Response ) : Promise< void > {
        try { res.json( await this.dbService.getAllCoins() ) }
        catch { res.status( 500 ).json( { error: 'Failed to fetch coins' } ) }
    }

}
