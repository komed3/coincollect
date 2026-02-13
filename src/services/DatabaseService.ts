import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

import type { CoinBase, CoinStats, CoinType, Database, SingleCoin } from '../types';


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

    private str ( v: any ) : string {
        return String( v ).trim();
    }

    private num ( v: any, d: number = 2 ) : number {
        return Number( parseFloat( v ).toFixed( d ) );
    }

    private date ( v: any ) : string {
        return new Date( v ).toISOString();
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

    // db management

    private async save () : Promise< void > {
        this.db.data._meta.updatedAt = this.now();
    }

    public async export () : Promise< Database > {
        return JSON.parse( JSON.stringify( this.db.data ) );
    }

    public async getDatabase () : Promise< Database > {
        return this.db.data;
    }

    // id generator

    private generateId ( length: number ) : string {
        let id = '';
        while ( id.length < length ) id += Math.floor( Math.random() * 10 ).toString();
        return id;
    }

    private generateBaseId () : string {
        let id: string;
        do { id = this.generateId( 8 ) }
        while ( this.db.data.collection.coins.some( c => c.id === id ) );
        return id;
    }

    private generateSingleId () : string {
        let id: string;
        do { id = this.generateId( 10 ) }
        while ( this.db.data.collection.items.some( i => i.id === id ) );
        return id;
    }

    // validation

    private validateCoinBase ( raw: Partial< CoinBase > ) : Partial< CoinBase > {
        const coin: Partial< CoinBase > = {};

        if ( ! raw.name?.trim().length ) throw new Error( 'Name is required' );
        else coin.name = this.str( raw.name );

        if ( raw.type ) coin.type = coin.type as CoinType;
        else coin.type = 'other' as CoinType;

        [ 'description', 'note', 'country', 'series', 'currency', 'issuer' ].forEach( k => {
            if ( k in raw && ( raw as any )[ k ] ) ( coin as any )[ k ] = this.str( ( raw as any )[ k ] );
        } );

        [ 'mintStartYear', 'mintEndYear' ].forEach( k => {
            if ( k in raw && ( raw as any )[ k ] ) ( coin as any )[ k ] = this.num( ( raw as any )[ k ] );
        } );

        [ 'issueDate', 'devaluationDate' ].forEach( k => {
            if ( k in raw && ( raw as any )[ k ] ) ( coin as any )[ k ] = this.date( ( raw as any )[ k ] );
        } );

        return coin;
    }

    private validateSingleCoin ( coin: Partial< SingleCoin > ) : Partial< SingleCoin > {
        return {};
    }

}
