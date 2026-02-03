import type { Request, Response } from 'express';
import DB from '../services/DatabaseService';

export class CoinController {

    private readonly dbService = DB;

    constructor () {}

    public async getAllCoins ( _: Request, res: Response ) : Promise< void > {
        try { res.json( await this.dbService.getAllCoins() ) }
        catch { res.status( 500 ).json( { error: 'Failed to fetch coins' } ) }
    }

    public async searchCatalog ( req: Request, res: Response ) : Promise< void > {
        try {
            const query = {
                text: req.query.text ? req.query.text as string : undefined,
                filters: {}, range: {},
                pagination: {
                    limit: req.query.limit ? parseInt( req.query.limit as string ) : undefined,
                    offset: req.query.offset ? parseInt( req.query.offset as string ) : undefined
                }
            };

            res.json( await this.dbService.searchCatalog( query ) );
        }
        catch ( error ) {
            res.status( 500 ).json( { error: 'Failed to fetch coins', cause: error } );
        }
    }

}
