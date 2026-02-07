import { readdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';
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

    public async getCurrency ( _: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to fetch currency', async () => {
            res.json( await this.dbService.getCurrency() );
        } );
    }

    public async setCurrency ( req: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to set currency', async () => {
            if ( typeof req.body.currency !== 'string' ) throw new Error( 'Invalid currency' );
            await this.dbService.setCurrency( req.body.currency );
            res.status( 200 ).send();
        } );
    }

    public async getStats ( _: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to fetch stats', async () => {
            res.json( await this.dbService.getStats() );
        } );
    }

    public async getValue ( _: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to fetch collection value', async () => {
            res.json( await this.dbService.getValue() );
        } );
    }

    public async export ( _: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to export catalog', async () => {
            res.json( await this.dbService.exportCatalog() );
        } );
    }

    public async update ( _: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to update database', async () => {
            await this.dbService.updateDb();
            res.status( 200 ).send();
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
            const coin = await this.dbService.createCoin( req.body );
            res.status( 201 ).json( coin );
        } );
    }

    public async updateCoin ( req: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to update coin', async () => {
            const { id } = req.params;
            const data = req.body;

            if ( typeof id !== 'string' ) res.status( 400 ).json( { error: 'Invalid ID' } );
            else if ( id !== data.id ) res.status( 400 ).json( { error: 'ID mismatch' } );
            else {
                const coin = await this.dbService.updateCoin( id, data );
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

    public async uploadImages ( req: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to upload images', async () => {
            const { id } = req.params;
            if ( typeof id !== 'string' ) throw new Error( 'Invalid ID' );

            const coin = await this.dbService.getCoinById( id );
            if ( ! coin ) {
                res.status( 404 ).json( { msg: 'Coin not found', id } );
                return;
            }

            const files = req.files as
                | { obverse?: Express.Multer.File[]; reverse?: Express.Multer.File[] }
                | undefined;

            if ( ! files || ( ! files.obverse && ! files.reverse ) ) {
                res.status( 400 ).json( { msg: 'No files uploaded' } );
                return;
            }

            const updates: any = { images: { ...( coin.images ?? {} ) } };
            if ( files.obverse?.[ 0 ] ) updates.images.obverse = files.obverse[ 0 ].filename;
            if ( files.reverse?.[ 0 ] ) updates.images.reverse = files.reverse[ 0 ].filename;

            const updated = this.dbService.updateCoin( id, updates, true );
            res.json( updated );
        } );
    }

    public async cleanupImages ( _: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to cleanup images', async () => {
            const images = new Set();
            ( await this.dbService.getAllCoins() ).forEach( c => {
                if ( c.images?.obverse ) images.add( c.images.obverse );
                if ( c.images?.reverse ) images.add( c.images.reverse );
                for ( const img of c.images?.other ?? [] ) images.add( img );
            } );

            const uploadDir = join( process.cwd(), 'uploads' );
            for ( const file of await readdir( uploadDir ) ) if ( ! images.has( file ) ) {
                await unlink( join( uploadDir, file ) );
            }

            res.status( 200 ).send();
        } );
    }

}
