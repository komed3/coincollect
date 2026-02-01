import type { Request, Response } from 'express';
import { DatabaseService } from '../services/DatabaseService';

export class CoinController {

    private dbService: DatabaseService;

    constructor () {
        this.dbService = DatabaseService.getInstance();
    }

    public async getAllCoins ( req: Request, res: Response ) : Promise< void > {
        try {
            const offset = req.query.offset ? parseInt( req.query.offset as string ) : undefined;
            const limit = req.query.limit ? parseInt( req.query.limit as string ) : undefined;

            const filters = {
                search: req.query.search as string,
                country: req.query.country as string,
                grade: req.query.grade as string,
                type: req.query.type as string,
                currency: req.query.currency as string,
                minYear: req.query.minYear ? parseInt( req.query.minYear as string ) : undefined,
                maxYear: req.query.maxYear ? parseInt( req.query.maxYear as string ) : undefined
            };

            res.json( await this.dbService.getCoins( offset, limit, filters ) );
        } catch ( error ) {
            res.status( 500 ).json( { error: 'Failed to fetch coins' } );
        }
    }

    public async getCoin ( req: Request, res: Response ) : Promise< void > {
        try {
            const { id } = req.params;
            const coin = await this.dbService.getCoinById( id as string );

            if ( coin ) res.json( coin );
            else res.status( 404 ).json( { error: 'Coin not found' } );
        } catch ( error ) {
            res.status( 500 ).json( { error: 'Failed to fetch coin' } );
        }
    }

}
