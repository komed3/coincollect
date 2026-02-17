import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

import {
    Acquisition, CoinBase, CoinGrade, CoinMaterial, CoinShape, CoinStats, CoinStatsItem, CoinStatus,
    CoinType, CoinValue, Database, SingleCoin, Suggestions, SuggestionTypes
} from '../types';


const DATA_DIR = join( process.cwd(), 'data' );
const DB_PATH = join( DATA_DIR, 'db.json' );

type CoinBaseRaw = Omit< CoinBase, 'id' | 'createdAt' | 'updatedAt' >;
type SingleCoinRaw = Omit< SingleCoin, 'id' | 'createdAt' | 'updatedAt' >;

export class DatabaseService {

    private static instance: DatabaseService;
    private static readonly validStatus: CoinStatus[] = [
        CoinStatus.Owned,
        CoinStatus.Duplicate,
        CoinStatus.ForSale
    ];

    private db!: Low< Database >;
    private writeTimer: NodeJS.Timeout | undefined;
    private writeDelay = 150;

    private constructor () {}

    public static getInstance () : DatabaseService {
        return DatabaseService.instance ||= new DatabaseService();
    }

    // helper

    private now () : string {
        return new Date().toISOString();
    }

    private bool ( value: any ) : boolean {
        return Boolean( value );
    }

    private str ( value: any ) : string {
        return String( value ).trim();
    }

    private list ( value: any ) : string[] {
        const arr = Array.isArray( value ) ? value : this.str( value ).split( ',' );
        return arr.map( this.str.bind( this ) );
    }

    private num ( value: any, digits: number = 2 ) : number {
        return Number( parseFloat( value ).toFixed( digits ) );
    }

    private date ( value: any ) : string {
        return new Date( value ).toISOString();
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
            suggestions: this.getDefaultSuggestions(),
            stats: this.getDefaultStats(),
            value: {}
        };
    }

    private getDefaultSuggestions () : Suggestions {
        return {
            series: [],
            country: [],
            currency: [],
            unit: [],
            issuer: [],
            catalog: [],
            certifier: [],
            mark: []
        };
    }

    private getDefaultStats () : CoinStats {
        return {
            totalCoins: 0,
            totalAcquisition: 0,
            totalValue: { min: 0, max: 0, avg: 0 },
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

    private scheduleWrite ( immediate: boolean = false ) : void {
        if ( this.writeTimer ) clearTimeout( this.writeTimer );
        if ( immediate ) { this.flush(); return }
        this.writeTimer = setTimeout( () => this.flush(), this.writeDelay );
    }

    private async flush () : Promise< void > {
        this.db.data._meta.updatedAt = this.now();
        await this.db.write();
    }

    public async save () : Promise< void > {
        await this.generateSuggestions( false );
        await this.generateStats( false );
        await this.calculateValue( false );
        this.scheduleWrite();
    }

    public async getDatabase () : Promise< Database > {
        return this.db.data;
    }

    public async export () : Promise< Database > {
        return JSON.parse( JSON.stringify( this.db.data ) );
    }

    // meta data

    public getMetaData () : Database[ '_meta' ] {
        return this.db.data._meta;
    }

    public getSchemaVersion () : string {
        return this.db.data._meta.schemaVersion;
    }

    public getDateCreatedAt () : Date {
        return new Date( this.db.data._meta.createdAt );
    }

    public getDateUpdatedAt () : Date {
        return new Date( this.db.data._meta.updatedAt );
    }

    // settings

    public getCurrency () : string {
        return this.db.data._meta.currency;
    }

    public async setCurrency ( currency: string ) : Promise< void > {
        this.db.data._meta.currency = currency.trim();
        await this.save();
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

    private validateCoinBase ( raw: CoinBaseRaw ) : Partial< CoinBase > {
        const coin: Partial< CoinBase > = {};

        if ( ! raw.name?.trim() ) throw new Error( 'Name is required' );
        else coin.name = this.str( raw.name );

        if ( raw.type ) coin.type = raw.type as CoinType;
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

        if ( raw.image ) {
            coin.image = {};

            if ( raw.image.obverse ) coin.image.obverse = this.str( raw.image.obverse );
            if ( raw.image.reverse ) coin.image.reverse = this.str( raw.image.reverse );
            if ( raw.image.other ) coin.image.other = this.str( raw.image.other );
        }

        if ( raw.identifier?.length ) coin.identifier = raw.identifier.filter( Boolean ).map(
            i => ( { catalog: this.str( i.catalog ), id: this.str( i.id ) } )
        );

        return coin;
    }

    private validateSingleCoin ( raw: SingleCoinRaw ) : Partial< SingleCoin > {
        if ( ! raw.baseId ) throw new Error( 'BaseId is required' );
        else if ( ! this.getCoinBase( raw.baseId ) ) throw new Error( 'BaseId does not exist' );

        const coin: Partial< SingleCoin > = {
            baseId: this.str( raw.baseId ),
            certified: this.bool( raw.certified ?? false ),
            amount: this.num( raw.amount ?? 1, 0 )
        };

        if ( raw.status ) coin.status = raw.status as CoinStatus;
        else coin.status = 'owned' as CoinStatus;

        if ( raw.grade ) coin.grade = raw.grade as CoinGrade;
        else coin.grade = 'unc' as CoinGrade;

        [ 'certIssuer', 'certNumber', 'notes', 'mintMark' ].forEach( k => {
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

        coin.value = ( raw.value ?? [] ).filter( Boolean ).map( v => {
            const min = this.num( Math.min( v.min ?? +Infinity, v.max ?? +Infinity, v.avg ?? +Infinity ) );
            const max = this.num( Math.max( v.max ?? -Infinity, v.min ?? -Infinity, v.avg ?? -Infinity ) );
            const avg = this.num( v.avg ?? ( min + max ) / 2 );
            return { date: this.date( v.date ), min, max, avg };
        } ).sort( ( a, b ) => new Date( b.date ).getTime() - new Date( a.date ).getTime() );

        return coin;
    }

    // suggestions

    public getAllSuggestions () : Suggestions {
        return this.db.data.suggestions;
    }

    public getSuggestions ( type: SuggestionTypes ) : string[] {
        return this.db.data.suggestions[ type ];
    }

    public async generateSuggestions ( save: boolean = true ) : Promise< void > {
        const suggestions = this.getDefaultSuggestions();

        this.db.data.collection.coins.forEach( c => {
            if ( c.series && ! suggestions.series.includes( c.series ) ) suggestions.series.push( c.series );
            if ( c.country && ! suggestions.country.includes( c.country ) ) suggestions.country.push( c.country );
            if ( c.currency && ! suggestions.currency.includes( c.currency ) ) suggestions.currency.push( c.currency );
            if ( c.nominal?.unit && ! suggestions.unit.includes( c.nominal.unit ) ) suggestions.unit.push( c.nominal.unit );
            if ( c.issuer && ! suggestions.issuer.includes( c.issuer ) ) suggestions.issuer.push( c.issuer );

            c.identifier?.forEach( i => { if ( i.catalog && ! suggestions.catalog.includes( i.catalog ) ) suggestions.catalog.push( i.catalog ) } );
            c.mintMarks?.forEach( m => { if ( ! suggestions.mark.includes( m ) ) suggestions.mark.push( m ) } );
        } );

        this.db.data.collection.items.forEach( i => {
            if ( i.certIssuer && ! suggestions.certifier.includes( i.certIssuer ) ) suggestions.certifier.push( i.certIssuer );
            if ( i.mintMark && ! suggestions.mark.includes( i.mintMark ) ) suggestions.mark.push( i.mintMark );
        } );

        this.db.data.suggestions = suggestions;
        if ( save ) this.scheduleWrite();
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

    // stats

    public getStats () : CoinStats {
        return this.db.data.stats;
    }

    public async generateStats ( save: boolean = true ) : Promise< CoinStats > {
        const coins = this.db.data.collection.items;
        const stats: CoinStats = this.getDefaultStats();
        let first = Infinity;

        for ( const c of coins ) {
            if ( ! DatabaseService.validStatus.includes( c.status ) ) continue;

            const base = this.getCoinBase( c.baseId )!;
            const amount = c.amount || 1;
            let purchase: number | undefined, value: number | undefined, weight: number | undefined;
            stats.totalCoins += amount;

            if ( c.acquisition?.date ) first = Math.min( first, new Date( c.acquisition.date ).getTime() );
            if ( c.acquisition?.price ) stats.totalAcquisition += purchase = c.acquisition.price * amount;

            if ( c.value?.length ) {
                stats.totalValue.avg += value = c.value[ 0 ].avg * amount;
                stats.totalValue.min += c.value[ 0 ].min * amount;
                stats.totalValue.max += c.value[ 0 ].max * amount;
            } else if ( purchase ) {
                stats.totalValue.avg += value = purchase;
                stats.totalValue.min += purchase;
                stats.totalValue.max += purchase;
            }

            const updateStats = ( obj: keyof CoinStats, key: string ) => {
                ( stats as any )[ obj ][ key ] ??= { coins: 0, acquisition: 0, value: 0 } as CoinStatsItem;

                ( stats as any )[ obj ][ key ].coins += amount;
                ( stats as any )[ obj ][ key ].acquisition += purchase ?? 0;
                ( stats as any )[ obj ][ key ].value += value ?? 0;
            };

            base.type && updateStats( 'type', base.type );
            c.status && updateStats( 'status', c.status );
            c.grade && updateStats( 'grade', c.grade );
            c.acquisition?.method && updateStats( 'acquisition', c.acquisition.method );
            base.country && updateStats( 'country', base.country );
            base.currency && updateStats( 'currency', base.currency );
            c.mintYear && updateStats( 'year', c.mintYear.toString() );

            if ( base.dimension?.weight ) {
                stats.totalWeight += weight = base.dimension.weight * amount;

                for ( const m of base.material ?? [] ) {
                    if ( ! ( m.material in stats.material ) ) stats.material[ m.material ] = {
                        coins: 0, acquisition: 0, value: 0, weight: 0,
                        pureWeight: 0, fineness: undefined, portion: 0
                    };

                    stats.material[ m.material ]!.coins += amount;
                    stats.material[ m.material ]!.acquisition += purchase ?? 0;
                    stats.material[ m.material ]!.value += value ?? 0;

                    stats.material[ m.material ]!.weight += this.num(
                        weight * ( ( m.portion ?? 100 ) / 100 ), 4
                    );
                    stats.material[ m.material ]!.pureWeight += this.num(
                        weight * ( ( m.fineness ?? 999 ) / 1000 ) * ( ( m.portion ?? 100 ) / 100 ), 4
                    );
                }
            }
        }

        stats.growth = this.num( stats.totalValue.avg / stats.totalAcquisition * 100 - 100, 3 );
        stats.collectionAge = new Date( first ).toISOString();

        const pureWeight = Object.values( stats.material ).reduce(
            ( s, i ) => s + ( ( i as any ).pureWeight ?? 0 ), 0
        );

        for ( const m of Object.keys( stats.material ) ) {
            const sm = ( stats.material as any )[ m ]!;

            sm.fineness = this.num( sm.pureWeight / sm.weight * 1000, 1 );
            sm.portion = pureWeight ? this.num( sm.pureWeight / pureWeight * 100 ) : 0;
            sm.acquisition *= sm.portion / 100;
            sm.value *= sm.portion / 100;
        }

        stats.material = Object.fromEntries(
            Object.entries( stats.material ).sort( ( a, b ) =>
                ( b[ 1 ].portion ?? 0 ) - ( a[ 1 ].portion ?? 0 )
            )
        );

        this.db.data.stats = stats;
        if ( save ) this.scheduleWrite();

        return stats;
    }

    // value

    public getValue () : CoinValue {
        return this.db.data.value;
    }

    public async calculateValue ( save: boolean = true ) : Promise< CoinValue > {
        const coins = this.db.data.collection.items;
        const value: CoinValue = {};
        let minYear = +Infinity, maxYear = -Infinity;
        let coinYear: Record< string, number > = {};
        let prev = undefined;

        const getYear = ( d: any ) : number => new Date( d ).getFullYear();

        for ( const c of coins ) {
            if ( ! DatabaseService.validStatus.includes( c.status ) ) continue;

            const acqYear = getYear( c.acquisition?.date );
            const valueDates = c.value?.map( v => getYear( v.date ) ) || [];

            coinYear[ c.id ] = Math.min( acqYear, ...valueDates );
            minYear = Math.min( minYear, acqYear, ...valueDates );
            maxYear = Math.max( maxYear, acqYear, ...valueDates );
        }

        for ( let y = minYear; y <= maxYear; y++ ) {
            const s = {
                coins: 0, acquisition: 0, value: { min: 0, max: 0, avg: 0 }, range: 0,
                variance: 0, change: 0, percent: 0, growth: 0, ratio: 0
            };

            for ( const c of coins ) {
                if ( ! DatabaseService.validStatus.includes( c.status ) ) continue;
                if ( coinYear[ c.id ] > y ) continue;

                const cnt = c.amount || 1;
                const acq = c.acquisition?.price || 0;

                s.coins += cnt;
                s.acquisition += this.num( acq * cnt );

                let is = false;
                for ( const v of c.value ?? [] ) {
                    if ( getYear( v.date ) <= y ) {
                        s.value.min += this.num( ( v.min ?? acq ) * cnt );
                        s.value.max += this.num( ( v.max ?? acq ) * cnt );
                        s.value.avg += this.num( ( v.avg ?? acq ) * cnt );
                        is = true;
                        break;
                    }
                }

                if ( ! is ) {
                    s.value.min += this.num( acq * cnt );
                    s.value.max += this.num( acq * cnt );
                    s.value.avg += this.num( acq * cnt );
                }
            }

            s.range = this.num( s.value.max - s.value.min );
            s.variance = this.num( s.range / ( s.value.avg || 1 ) * 100, 3 );
            s.change = this.num( s.value.avg - ( prev?.value?.avg ?? 0 ) );
            s.percent = this.num( s.change / s.value.avg * 100, 3 );
            s.growth = this.num( s.change - ( s.acquisition - ( prev?.acquisition ?? 0 ) ) );
            s.ratio = this.num( s.growth / s.change, 3 );

            value[ y ] = s;
            prev = s;
        }

        this.db.data.value = value;
        if ( save ) this.scheduleWrite();

        return value;
    }

}

const DB = DatabaseService.getInstance();
await DB.init();

export default DB;
