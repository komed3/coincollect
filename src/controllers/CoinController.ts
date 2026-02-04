import type { Request, Response } from 'express';
import DB from '../services/DatabaseService';

export class CoinController {

    private readonly dbService = DB;

    constructor () {}

    private async catch ( res: Response, msg: string, fn: () => Promise< void > ) : Promise< void > {
        try { await fn() } catch ( err ) { res.status( 500 ).json( { msg, err } ) }
    }

    public async getMeta ( _: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to fetch meta', async () => {
            res.json( await this.dbService.getMetaData() );
        } );
    }

    public async lastModified ( _: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to fetch modification date', async () => {
            res.json( ( await this.dbService.getDateUpdatedAt() ).toISOString() );
        } );
    }

    public async getStats ( _: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to fetch stats', async () => {
            res.json( await this.dbService.getStats() );
        } );
    }

    public async export ( _: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to export catalog', async () => {
            res.json( await this.dbService.exportCatalog() );
        } );
    }

    public async reset ( _: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to reset database', async () => {
            res.json( await this.dbService.resetDb() );
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

    public async createCoin ( req: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to create coin', async () => {
            res.status( 201 ).json( await this.dbService.createCoin( req.body ) );
        } );
    }

    public async updateCoin ( req: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to update coin', async () => {
            const { id } = req.params;
            const data = req.body;

            if ( typeof id !== 'string' ) res.status( 400 ).json( { error: 'Invalid ID' } );
            else if ( id !== data.id ) res.status( 400 ).json( { error: 'ID mismatch' } );
            else {
                const coin = this.dbService.updateCoin( id, data );
                if ( coin ) res.json( coin );
                else res.status( 404 ).json( { msg: 'Coin not found', id } );
            }
        } );
    }

    public async deleteCoin ( req: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to delete coin', async () => {
            const { id } = req.params;

            if ( typeof id !== 'string' ) res.status( 400 ).json( { error: 'Invalid ID' } );
            else if ( await this.dbService.deleteCoin( id ) ) res.status( 204 ).send();
            else res.status( 404 ).json( { msg: 'Coin not found', id } );
        } );
    }

}
