import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { Coin } from '../../../shared/types';
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

    public async createCoin ( req: Request, res: Response ) : Promise< void > {
        try {
            const newCoin: Coin = req.body;

            if ( ! newCoin.name || ! newCoin.type ) {
                res.status( 400 ).json( { error: 'Missing required fields' } );
                return;
            }

            newCoin.id ||= uuidv4();
            const now = new Date().toISOString();
            newCoin.createdAt ||= now;
            newCoin.updatedAt ||= now;

            await this.dbService.addCoin( newCoin );
            res.status( 201 ).json( newCoin );
        } catch ( error ) {
            res.status( 500 ).json( { error: 'Failed to create coin' } );
        }
    }

    public async updateCoin ( req: Request, res: Response ) : Promise< void > {
        try {
            const { id } = req.params;
            const coinUpdate: Coin = req.body;

            if ( typeof id !== 'string' ) {
                res.status( 400 ).json( { error: 'Invalid ID' } );
                return;
            }

            if ( id !== coinUpdate.id ) {
                res.status( 400 ).json( { error: 'ID mismatch' } );
                return;
            }

            coinUpdate.updatedAt = new Date().toISOString();
            await this.dbService.updateCoin( coinUpdate );
            res.json( coinUpdate );
        } catch ( error ) {
            res.status( 500 ).json( { error: 'Failed to update coin' } );
        }
    }

}
