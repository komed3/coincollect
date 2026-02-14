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

    public async uploadImages ( req: Request, res: Response ) : Promise< void > {
        await this.catch( res, 'Failed to upload images', async () => {
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

            const updates: any = { images: { ...( coin.images ?? {} ) } };
            if ( files.obverse?.[ 0 ] ) updates.images.obverse = files.obverse[ 0 ].filename;
            if ( files.reverse?.[ 0 ] ) updates.images.reverse = files.reverse[ 0 ].filename;
            if ( files.other?.[ 0 ] ) updates.images.other = files.other[ 0 ].filename;

            const updated = this.dbService.updateCoinBase( id, updates );
            res.json( updated );
        } );
    }

}
