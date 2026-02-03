import type { Request, Response } from 'express';
import DB from '../services/DatabaseService';

export class CoinController {

    private readonly dbService = DB;

    constructor () {}

    public async getAllCoins ( _: Request, res: Response ) : Promise< void > {
        try { res.json( await this.dbService.getAllCoins() ) }
        catch ( error ) { res.status( 500 ).json( { msg: 'Failed to fetch coins', error } ) }
    }

    public async searchCatalog ( req: Request, res: Response ) : Promise< void > {
        try {
            const query = {
                text: req.query.text ? req.query.text as string : undefined,
                filters: ( req.query.filters ?? {} ) as Record< string, any >,
                range: ( req.query.range ?? {} ) as Record< string, { min?: number; max?: number } >,
                pagination: {
                    limit: req.query.limit ? parseInt( req.query.limit as string ) : undefined,
                    offset: req.query.offset ? parseInt( req.query.offset as string ) : undefined
                }
            };

            res.json( await this.dbService.searchCatalog( query ) );
        }
        catch ( error ) {
            res.status( 500 ).json( { msg: 'Failed to fetch coins', error } );
        }
    }

    public async getCoin ( req: Request, res: Response ) : Promise< void > {
        try {
            const { id } = req.params;
            const coin = await this.dbService.getCoinById( id as string );

            if ( coin ) res.json( coin );
            else res.status( 404 ).json( { error: 'Coin not found' } );
        } catch ( error ) {
            res.status( 500 ).json( { msg: 'Failed to fetch coin', error } );
        }
    }

}
