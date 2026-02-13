import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

import type {
    Acquisition, CoinBase, CoinGrade, CoinMaterial, CoinShape, CoinStats, CoinStatus,
    CoinType, Database, SingleCoin
} from '../types';


const DATA_DIR = join( process.cwd(), 'data' );
const DB_PATH = join( DATA_DIR, 'db.json' );

type CoinBaseRaw = Omit< CoinBase, 'id' | 'createdAt' | 'updatedAt' >;
type SingleCoinRaw = Omit< SingleCoin, 'id' | 'createdAt' | 'updatedAt' >;

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

    private bool ( v: any ) : boolean {
        return Boolean( v );
    }

    private str ( v: any ) : string {
        return String( v ).trim();
    }

    private list ( v: any ) : string[] {
        const arr = Array.isArray( v ) ? v : this.str( v ).split( ',' );
        return arr.map( this.str.bind( this ) );
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

        if ( ! raw.name?.trim() ) throw new Error( 'Name is required' );
        else coin.name = this.str( raw.name );

        if ( raw.type ) coin.type = coin.type as CoinType;
        else coin.type = 'other' as CoinType;

        [ 'description', 'notes', 'country', 'series', 'currency', 'issuer' ].forEach( k => {
            if ( k in raw && ( raw as any )[ k ] ) ( coin as any )[ k ] = this.str( ( raw as any )[ k ] );
        } );

        [ 'tags', 'mintMarks' ].forEach( k => {
            if ( k in raw && ( raw as any )[ k ] ) ( coin as any )[ k ] = this.list( ( raw as any )[ k ] );
        } );

        [ 'mintStartYear', 'mintEndYear' ].forEach( k => {
            if ( k in raw && ( raw as any )[ k ] ) ( coin as any )[ k ] = this.num( ( raw as any )[ k ], 0 );
        } );

        [ 'issueDate', 'devaluationDate' ].forEach( k => {
            if ( k in raw && ( raw as any )[ k ] ) ( coin as any )[ k ] = this.date( ( raw as any )[ k ] );
        } );

        if ( raw.nominal?.value ) {
            coin.nominal = { value: this.str( raw.nominal.value ) };
            if ( raw.nominal.unit ) coin.nominal.unit = this.str( raw.nominal.unit );
        }

        if ( raw.design ) {
            coin.design = {};

            if ( raw.design.shape ) coin.design.shape = raw.design.shape as CoinShape;
            if ( raw.design.obverse ) coin.design.obverse = this.str( raw.design.obverse );
            if ( raw.design.reverse ) coin.design.reverse = this.str( raw.design.reverse );
            if ( raw.design.edge ) coin.design.edge = this.str( raw.design.edge );
        }

        if ( raw.material?.length ) coin.material = raw.material.filter( Boolean ).map( m => {
            const material: any = { material: m.material as CoinMaterial };

            if ( m.fineness ) material.fineness = this.num( m.fineness, 1 );
            if ( m.portion ) material.portion = this.num( m.portion, 2 );

            return material;
        } );

        if ( raw.dimension ) {
            coin.dimension = {};

            if ( raw.dimension.diameter ) coin.dimension.diameter = this.num( raw.dimension.diameter, 3 );
            if ( raw.dimension.thickness ) coin.dimension.thickness = this.num( raw.dimension.thickness, 3 );
            if ( raw.dimension.weight ) coin.dimension.weight = this.num( raw.dimension.weight, 3 );
        }

        if ( raw.images ) {
            coin.images = {};

            if ( raw.images.obverse ) coin.images.obverse = this.str( raw.images.obverse );
            if ( raw.images.reverse ) coin.images.reverse = this.str( raw.images.reverse );
            if ( raw.images.other ) coin.images.other = [
                ...raw.images.other.filter( Boolean ).map( this.str.bind( this ) )
            ];
        }

        if ( raw.identifiers?.length ) coin.identifiers = raw.identifiers.filter( Boolean ).map(
            i => ( { catalog: this.str( i.catalog ), id: this.str( i.id ) } )
        );

        return coin;
    }

    private validateSingleCoin ( raw: Partial< SingleCoin > ) : Partial< SingleCoin > {
        if ( ! raw.baseId?.trim() ) throw new Error( 'BaseId is required' );
        else if ( ! this.db.data.collection.coins.some( c => c.id === raw.baseId ) ) throw new Error( 'BaseId does not exist' );

        const coin: Partial< SingleCoin > = {
            baseId: this.str( raw.baseId ),
            certified: this.bool( raw.certified ?? false ),
            amount: this.num( raw.amount ?? 1, 0 )
        };

        if ( raw.status ) coin.status = coin.status as CoinStatus;
        else coin.status = 'owned' as CoinStatus;

        if ( raw.grade ) coin.grade = coin.grade as CoinGrade;
        else coin.grade = 'unc' as CoinGrade;

        [ 'notes', 'mintMark' ].forEach( k => {
            if ( k in raw && ( raw as any )[ k ] ) ( coin as any )[ k ] = this.str( ( raw as any )[ k ] );
        } );

        [ 'mintYear', 'mintage' ].forEach( k => {
            if ( k in raw && ( raw as any )[ k ] ) ( coin as any )[ k ] = this.num( ( raw as any )[ k ], 0 );
        } );

        if ( raw.acquisition?.method && raw.acquisition?.date ) {
            coin.acquisition = {
                method: raw.acquisition.method as Acquisition,
                date: this.date( raw.acquisition.date )
            };

            if ( raw.acquisition.price ) coin.acquisition.price = this.num( raw.acquisition.price );
            if ( raw.acquisition.notes ) coin.acquisition.notes = this.str( raw.acquisition.notes );
        } else throw new Error( 'Acquisition is required' );

        coin.value = ( raw.value ?? [] ).filter( Boolean ).map( v => ( {
            date: this.date( v.date ), price: this.num( v.price )
        } ) ).sort( ( a, b ) => new Date( b.date ).getTime() - new Date( a.date ).getTime() );

        return coin;
    }

    // coin base

    public getAllCoinBases () : CoinBase[] {
        return this.db.data.collection.coins;
    }

    public getCoinBase ( id: string ) : CoinBase | undefined {
        return this.db.data.collection.coins.find( c => c.id === id );
    }

    public async addCoinBase ( raw: CoinBaseRaw ) : Promise< CoinBase > {
        const now = this.now();
        const coin = {
            ...this.validateCoinBase( raw ),
            id: this.generateBaseId(),
            createdAt: now,
            updatedAt: now
        } as CoinBase;

        this.db.data.collection.coins.push( coin );
        await this.save();

        return coin;
    }

    public async setCoinBase ( id: string, raw: CoinBaseRaw ) : Promise< CoinBase > {
        const coin = this.getCoinBase( id );
        if ( ! coin ) throw new Error( `Base coin ${ id } not found` );

        const updated: CoinBase = {
            ...this.validateCoinBase( raw ),
            id: coin.id,
            createdAt: coin.createdAt,
            updatedAt: this.now()
        } as CoinBase;

        this.db.data.collection.coins = this.db.data.collection.coins.map( c => updated.id === c.id ? updated : c );
        await this.save();

        return coin;
    }

    public async updateCoinBase ( id: string, raw: CoinBaseRaw ) : Promise< CoinBase > {
        const coin = this.getCoinBase( id );
        if ( ! coin ) throw new Error( `Base coin ${ id } not found` );

        const updated = this.validateCoinBase( { ...coin, ...raw } );
        Object.assign( coin, updated, { updatedAt: this.now() } );
        await this.save();

        return coin;
    }

    public async deleteCoinBase ( id: string ) : Promise< void > {
        const index = this.db.data.collection.coins.findIndex( c => c.id === id );
        if ( index === -1 ) throw new Error( `Base coin ${ id } not found` );

        this.db.data.collection.items = this.db.data.collection.items.filter( i => i.baseId !== id );
        this.db.data.collection.coins.splice( index, 1 );
        await this.save();
    }

    // single coin

    public getAllSingleCoins () : SingleCoin[] {
        return this.db.data.collection.items;
    }

    public getSingleCoin ( id: string ) : SingleCoin | undefined {
        return this.db.data.collection.items.find( i => i.id === id );
    }

    public getSingleCoinsByBase ( baseId: string ) : SingleCoin[] {
        return this.db.data.collection.items.filter( i => i.baseId === baseId );
    }

    public async addSingleCoin ( raw: SingleCoinRaw ) : Promise< SingleCoin > {
        const now = this.now();
        const coin: SingleCoin = {
            ...this.validateSingleCoin( raw ),
            id: this.generateSingleId(),
            createdAt: now,
            updatedAt: now
        } as SingleCoin;

        this.db.data.collection.items.push( coin );
        await this.save();

        return coin;
    }

    public async setSingleCoin ( id: string, raw: SingleCoinRaw ) : Promise< SingleCoin > {
        const coin = this.getSingleCoin( id );
        if ( ! coin ) throw new Error( `Single coin ${ id } not found` );

        const updated: SingleCoin = {
            ...this.validateSingleCoin( raw ),
            id: coin.id,
            createdAt: coin.createdAt,
            updatedAt: this.now()
        } as SingleCoin;

        this.db.data.collection.items = this.db.data.collection.items.map( c => updated.id === c.id ? updated : c );
        await this.save();

        return coin;
    }

    public async updateSingleCoin ( id: string, raw: SingleCoinRaw ) : Promise< SingleCoin > {
        const coin = this.getSingleCoin( id );
        if ( ! coin ) throw new Error( `Single coin ${ id } not found` );

        const updated = this.validateSingleCoin( { ...coin, ...raw } );
        Object.assign( coin, updated, { updatedAt: this.now() } );
        await this.save();

        return coin;
    }

    public async deleteSingleCoin ( id: string ) : Promise< void > {
        const index = this.db.data.collection.items.findIndex( c => c.id === id );
        if ( index === -1 ) throw new Error( `Single coin ${ id } not found` );

        this.db.data.collection.items.splice( index, 1 );
        await this.save();
    }

}
