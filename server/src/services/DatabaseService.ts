import { ensureDirSync, existsSync, readJson, writeJson, writeJsonSync } from 'fs-extra';
import { dirname, join } from 'path';

import { Coin, DatabaseSchema } from '../../../shared/types';

const DB_PATH = join( __dirname, '../../data/db.json' );
const INITIAL_DB: DatabaseSchema = {
    meta: {
        version: '1.0',
        lastExport: new Date().toISOString()
    },
    settings: {
        currency: 'EUR',
        language: 'de'
    },
    coins: []
};

export class DatabaseService {

    private static instance: DatabaseService;
    private data: DatabaseSchema | undefined = undefined;

    private constructor () {
        this.ensureDbExists();
    }

    private ensureDbExists () : void {
        if ( ! existsSync( DB_PATH ) ) {
            ensureDirSync( dirname( DB_PATH ) );
            writeJsonSync( DB_PATH, INITIAL_DB, { spaces: 2 } );
            console.log( 'Created new database file at', DB_PATH );
        }
    }

    public async load () : Promise< DatabaseSchema > {
        try { return this.data ||= await readJson( DB_PATH ) }
        catch ( error ) {
            console.error( 'Failed to load database:', error );
            throw error;
        }
    }

    public async save ( data: DatabaseSchema ) : Promise< void > {
        try {
            await writeJson( DB_PATH, data, { spaces: 2 } );
            this.data = data;
        } catch ( error ) {
            console.error( 'Failed to save database:', error );
            throw error;
        }
    }

    public async addCoin ( coin: Coin ) : Promise< void > {
        const db = await this.load();
        db.coins.push( coin );
        await this.save( db );
    }

    public async updateCoin( updatedCoin: Coin ) : Promise< void > {
        const db = await this.load();
        const index = db.coins.findIndex( c => c.id === updatedCoin.id );
        if ( index !== -1 ) {
            db.coins[ index ] = updatedCoin;
            await this.save( db );
        } else {
            throw new Error( `Coin with id ${updatedCoin.id} not found` );
        }
    }

    public async deleteCoin ( id: string ) : Promise< void > {
        const db = await this.load();
        const initialLength = db.coins.length;
        db.coins = db.coins.filter( c => c.id !== id );
        if ( db.coins.length !== initialLength ) {
            await this.save( db );
        }
    }

    public static getInstance () : DatabaseService {
        return DatabaseService.instance ||= new DatabaseService();
    }

    public static getDbPath () : string {
        return DB_PATH;
    }

}
