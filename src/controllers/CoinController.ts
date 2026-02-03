import type { Request, Response } from 'express';
import DB from '../services/DatabaseService';

export class CoinController {

    private readonly dbService = DB;

    constructor () {}

    private async catch ( res: Response, msg: string, fn: () => Promise< void > ) : Promise< void > {
        try { await fn() } catch ( err ) { res.status( 500 ).json( { msg, err } ) }
    }

    public async getMeta ( _:Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to fetch meta', async () => {
            res.json( await this.dbService.getMetaData() );
        } );
    }

    public async getAllCoins ( _: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to fetch coins', async () => {
            res.json( await this.dbService.getAllCoins() );
        } );
    }

    public async searchCatalog ( req: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to search catalog', async () => {
            res.json( await this.dbService.searchCatalog( {
                text: req.query.text ? req.query.text as string : undefined,
                filters: ( req.query.filters ?? {} ) as Record< string, any >,
                range: ( req.query.range ?? {} ) as Record< string, { min?: number; max?: number } >,
                pagination: {
                    limit: req.query.limit ? parseInt( req.query.limit as string ) : undefined,
                    offset: req.query.offset ? parseInt( req.query.offset as string ) : undefined
                }
            } ) );
        } );
    }

    public async getCoin ( req: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to fetch coin by id', async () => {
            const { id } = req.params;
            const coin = await this.dbService.getCoinById( id as string );

            if ( coin ) res.json( coin );
            else res.status( 404 ).json( { msg: 'Coin not found', id } );
        } );
    }

}
