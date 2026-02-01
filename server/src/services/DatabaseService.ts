import { ensureDirSync, existsSync, readJson, writeJson, writeJsonSync } from 'fs-extra';
import { dirname, join } from 'node:path';

import type { AppSettings, Coin, DatabaseSchema } from '../../../shared/types';

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

    public async getCoins ( offset?: number, limit?: number, filters?: {
        search?: string, type?: string, country?: string, grade?: string, currency?: string,
        material?: string, minYear?: number, maxYear?: number
    } ) : Promise< { coins: Coin[], total: number } > {
        const db = await this.load();
        let coins = db.coins;

        if ( filters ) {
            if ( filters.search ) {
                const query = filters.search.toLowerCase();
                coins = coins.filter( c =>
                    c.name.toLowerCase().includes( query ) ||
                    ( c.series && c.series.toLowerCase().includes( query ) ) ||
                    c.originCountry.toLowerCase().includes( query ) ||
                    c.tags?.some( t => t.toLowerCase().includes( query ) )
                );
            }

            if ( filters.type ) coins = coins.filter( c => c.type === filters.type );
            if ( filters.country ) coins = coins.filter( c => c.originCountry === filters.country );
            if ( filters.grade ) coins = coins.filter( c => c.grade === filters.grade );
            if ( filters.currency ) coins = coins.filter( c => c.faceValue?.currency === filters.currency );
            if ( filters.minYear !== undefined ) coins = coins.filter( c => ( c.mintYear || 0 ) >= filters.minYear! );
            if ( filters.maxYear !== undefined ) coins = coins.filter( c => ( c.mintYear || 0 ) <= filters.maxYear! );

            if ( filters.material ) {
                const material = filters.material.toLowerCase();
                coins = coins.filter( c =>
                    c.material?.some( m => m.name.toLowerCase() === material )
                );
            }
        }

        const total = coins.length;
        if ( offset !== undefined && limit !== undefined ) coins = coins.slice( offset, offset + limit );
        return { coins, total };
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

    public async deleteAllCoins () : Promise< void > {
        const db = await this.load();
        db.coins = [];
        await this.save( db );
    }

    public async getSettings () : Promise< AppSettings > {
        const db = await this.load();
        return db.settings;
    }

    public async updateSettings ( settings: Partial< AppSettings > ) : Promise< AppSettings > {
        const db = await this.load();
        db.settings = { ...db.settings, ...settings };
        await this.save( db );
        return db.settings;
    }

    public static getInstance () : DatabaseService {
        return DatabaseService.instance ||= new DatabaseService();
    }

    public static getDbPath () : string {
        return DB_PATH;
    }

}
