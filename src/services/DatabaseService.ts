import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

import type { CoinStats, Database } from '../types';


const DATA_DIR = join( process.cwd(), 'data' );
const DB_PATH = join( DATA_DIR, 'db.json' );

export class DatabaseService {

    private static instance: DatabaseService;
    private db!: Low< Database >;

    private constructor () {}

    public static getInstance () : DatabaseService {
        return DatabaseService.instance ||= new DatabaseService();
    }

    // helper

    private now () : string {
        return new Date().toISOString();
    }

    // init db

    public async init () : Promise< void > {
        try { await mkdir( DATA_DIR, { recursive: true } ) }
        catch ( e ) { throw new Error( 'Failed to create data directory:', { cause: e } ) }

        this.db = new Low( new JSONFile( DB_PATH ), this.getDefaultDB() );
        await this.db.read();
    }

    private getDefaultDB () : Database {
        const now = this.now();

        return {
            _meta: {
                schemaVersion: '1',
                currency: 'EUR',
                createdAt: now,
                updatedAt: now
            },
            collection: {
                coins: [],
                items: []
            },
            value: {},
            stats: this.getDefaultStats()
        };
    }

    private getDefaultStats () : CoinStats {
        return {
            totalCoins: 0,
            totalAcquisition: 0,
            totalOmv: 0,
            growth: 0,
            totalWeight: 0,
            collectionAge: this.now(),
            type: {},
            status: {},
            grade: {},
            acquisition: {},
            country: {},
            currency: {},
            year: {},
            material: {}
        };
    }

}
