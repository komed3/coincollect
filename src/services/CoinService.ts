import type { Request, Response } from 'express';
import DB from './DatabaseService';

export class CoinService {

    private readonly dbService = DB;

    private async catch ( res: Response, msg: string, fn: () => Promise< void > ) : Promise< void > {
        try { await fn() } catch ( err ) { res.status( 500 ).json( { msg, err } ) }
    }

    public getStats ( _: Request, res: Response ) : void {
        this.catch( res, 'Failed to fetch stats', async () => {
            res.json( this.dbService.getStats() );
        } );
    }

    public getValue ( _: Request, res: Response ) : void {
        this.catch( res, 'Failed to fetch value', async () => {
            res.json( this.dbService.getValue() );
        } );
    }

    public searchCoins ( req: Request, res: Response ) : void {
        this.catch( res, 'Failed to search coins', async () => {
            res.json( this.dbService.searchCoins( req.body ) );
        } );
    }

    public async addCoinBase ( req: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to add coin base', async () => {
            const coin = await this.dbService.addCoinBase( req.body );
            res.status( 201 ).json( coin );
        } );
    }

    public async setCoinBase ( req: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to update coin base', async () => {
            const { id } = req.params;
            const data = req.body;

            if ( typeof id !== 'string' ) res.status( 400 ).json( { error: 'Invalid ID' } );
            else if ( id !== data.id ) res.status( 400 ).json( { error: 'ID mismatch' } );
            else {
                const coin = await this.dbService.setCoinBase( id, data );
                if ( coin ) res.json( coin );
                else res.status( 404 ).json( { msg: 'Coin not found', id } );
            }
        } );
    }

    public async addSingleCoin ( req: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to add single coin', async () => {
            const coin = await this.dbService.addSingleCoin( req.body );
            res.status( 201 ).json( coin );
        } );
    }

    public async setSingleCoin ( req: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to update single coin', async () => {
            const { id } = req.params;
            const data = req.body;

            if ( typeof id !== 'string' ) res.status( 400 ).json( { error: 'Invalid ID' } );
            else if ( id !== data.id ) res.status( 400 ).json( { error: 'ID mismatch' } );
            else {
                const coin = await this.dbService.setSingleCoin( id, data );
                if ( coin ) res.json( coin );
                else res.status( 404 ).json( { msg: 'Coin not found', id } );
            }
        } );
    }

    public async uploadImages ( req: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to upload image', async () => {
            const { id } = req.params;
            if ( typeof id !== 'string' ) throw new Error( 'Invalid ID' );

            const coin = this.dbService.getCoinBase( id );
            if ( ! coin ) {
                res.status( 404 ).json( { msg: 'Coin not found', id } );
                return;
            }

            const files = req.files as | {
                obverse?: Express.Multer.File[];
                reverse?: Express.Multer.File[];
                other?: Express.Multer.File[]
            } | undefined;

            if ( ! files || ( ! files.obverse && ! files.reverse && ! files.other ) ) {
                res.status( 400 ).json( { msg: 'No files uploaded' } );
                return;
            }

            const updates: any = { image: { ...( coin.image ?? {} ) } };
            if ( files.obverse?.[ 0 ] ) updates.image.obverse = files.obverse[ 0 ].filename;
            if ( files.reverse?.[ 0 ] ) updates.image.reverse = files.reverse[ 0 ].filename;
            if ( files.other?.[ 0 ] ) updates.image.other = files.other[ 0 ].filename;

            const updated = this.dbService.updateCoinBase( id, updates );
            res.json( updated );
        } );
    }

    public async exportDatabase ( _: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to export database', async () => {
            const data = await this.dbService.export();
            res.setHeader( 'Content-Type', 'application/json' );
            res.setHeader( 'Content-Disposition', 'attachment; filename="coincollect-db.json"' );
            res.json( data );
        } );
    }

    public async refreshDatabase ( _: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to update database', async () => {
            await this.dbService.updateDatabase();
            res.json( { ok: true } );
        } );
    }

    public async clearDatabase ( _: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to clear database', async () => {
            await this.dbService.clearDatabase();
            res.json( { ok: true } );
        } );
    }

    public async getUnusedImages ( _: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to find unused images', async () => {
            const images = await this.dbService.getUnusedImages();
            res.json( { unused: images } );
        } );
    }

    public async pruneUnusedImages ( _: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to prune unused images', async () => {
            const deleted = await this.dbService.pruneUnusedImages();
            res.json( { deleted } );
        } );
    }

}
