import { join } from 'node:path';
import deepmerge from 'deepmerge';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { v4 as uuidv4 } from 'uuid';

import { CoinStatus } from '../types';
import type {
    Coin, CoinGrade, CoinShape, CoinStats, CoinStatsItem,
    CoinStatsRecord, CoinType, Database
} from '../types';

type PartialCoinInput = Partial< Omit< Coin, 'id' | 'createdAt' | 'updatedAt' > >;

export class DatabaseService {

    private static instance: DatabaseService;
    private static readonly validStatus: CoinStatus[] = [
        CoinStatus.Owned,
        CoinStatus.Duplicate,
        CoinStatus.ForSale
    ];

    private dbFile: string;
    private adapter: JSONFile< Database > | undefined;
    private db: Low< Database > | undefined;
    private writeTimer: NodeJS.Timeout | undefined;
    private writeDelay = 150;

    private constructor () {
        this.dbFile = join( process.cwd(), 'data/db.json' );
    }

    private defaultData () : Database {
        const now = new Date().toISOString();

        return {
            _meta: {
                schemaVersion: '1',
                currency: 'USD',
                createdAt: now,
                updatedAt: now
            },
            coins: [],
            value: {},
            stats: {
                totalCoins: 0,
                totalPurchase: 0,
                totalOmv: 0,
                growth: 0,
                totalWeight: 0,
                collectionAge: '',
                type: {},
                status: {},
                grade: {},
                country: {},
                currency: {},
                year: {}
            }
        };
    }

    private scheduleWrite ( immediate: boolean = false ) : void {
        if ( ! this.db ) return;
        if ( this.writeTimer ) clearTimeout( this.writeTimer );
        if ( immediate ) { this.flush(); return }
        this.writeTimer = setTimeout( () => this.flush(), this.writeDelay );
    }

    private async flush () : Promise< void > {
        if ( ! this.db ) return;

        this.db.data._meta.updatedAt = new Date().toISOString();
        this.db.data.coins.sort( ( a, b ) => (
            new Date( b.purchase?.date ?? b.mint?.issueDate ?? b.mint?.year ?? b.createdAt ).getTime() -
            new Date( a.purchase?.date ?? a.mint?.issueDate ?? a.mint?.year ?? a.createdAt ).getTime()
        ) );

        await this.db.write();
    }

    private getNestedValue ( obj: any, pathStr: string ) : any {
        const parts = pathStr.split( '.' );
        let cur = obj;

        for ( const p of parts ) {
            if ( ! cur ) return undefined;
            cur = cur[ p ];
        }

        return cur;
    }

    private sanitizeAndValidateInput ( input: PartialCoinInput, creating: boolean = false ) : PartialCoinInput & {
        name: string; type: CoinType; grade: CoinGrade; status: CoinStatus
    } {
        const out: any = {};

        const has = ( o: any, k: string ) => Object.prototype.hasOwnProperty.call( o, k );
        const str = ( v: any ) => v === null ? null : String( v ).trim();
        const num = ( v: any ) => v === null ? null : Number( v );
        const obj = ( key: string, fn: ( v: any ) => any ) => {
            if ( ! has( input, key ) ) return;
            out[ key ] = ( input as any )[key] === null ? null : fn( ( input as any )[ key ] );
        };

        if ( has( input, 'name' ) && input.name !== null ) out.name = str( input.name );
        else throw new Error( 'Name is required' );

        for ( const k of [ 'type', 'grade', 'status' ] as const ) {
            if ( has( input, k ) ) out[ k ] = input[ k ] === null ? null : input[ k ];
            else if ( creating ) out[ k ] = k === 'type' ? 'other' : k === 'grade' ? 'unc' : 'owned';
        }

        for ( const k of [ 'country', 'currency', 'series', 'description', 'note' ] as const ) {
            if ( has( input, k ) ) out[ k ] = str( input[ k ] );
        }

        if ( has( input, 'amount' ) ) out.amount = num( input.amount );
        if ( has( input, 'tags' ) ) out.tags = input.tags === null ? null : input.tags!.filter( Boolean ).map( String );

        obj( 'mint', m => ( {
            year: has( m, 'year' ) ? num( m.year ) : undefined,
            mark: has( m, 'mark' ) ? str( m.mark ) : undefined,
            issueDate: has( m, 'issueDate' ) && m.issueDate !== null
                ? new Date( m.issueDate ).toISOString()
                : m.issueDate,
            mintage: has( m, 'mintage' ) ? num( m.mintage ) : undefined
        } ) );

        obj( 'nominalValue', n => ( {
            value: has( n, 'value' ) ? num( n.value ) : undefined,
            unit: has( n, 'unit' ) ? str( n.unit ) : undefined
        } ) );

        obj( 'dimension', d => ( {
            diameter: has( d, 'diameter' ) ? num( d.diameter ) : undefined,
            thickness: has( d, 'thickness' ) ? num( d.thickness ) : undefined,
            weight: has( d, 'weight' ) ? num( d.weight ) : undefined
        } ) );

        obj( 'design', d => ( {
            shape: has( d, 'shape' ) ? d.shape : undefined,
            obverse: has( d, 'obverse' ) ? str( d.obverse ) : undefined,
            reverse: has( d, 'reverse' ) ? str( d.reverse ) : undefined,
            edge: has( d, 'edge' ) ? str( d.edge ) : undefined
        } ) );

        obj( 'purchase', p => ( {
            value: has( p,'value' ) ? num( p.value ) : undefined,
            date: has( p,'date' ) && p.date !== null
                ? new Date( p.date ).toISOString()
                : p.date
        } ) );

        if ( has( input, 'material' ) ) {
            out.material = input.material === null ? null : input.material!.filter( Boolean ).map( m => ( {
                material: str( m.material ),
                fineness: m.fineness ?? null,
                portion: m.portion ?? 100
            } ) );
        }

        if ( has( input, 'omv' ) ) {
            out.omv = input.omv === null ? null : input.omv!.filter( Boolean ).map( o => ( {
                value: Number( o.value ),
                date: new Date( o.date ).toISOString()
            } ) );
        }

        if ( has( input, 'images' ) ) {
            out.images = input.images === null ? null : {
                obverse: has( input.images, 'obverse' ) ? str( input.images!.obverse ) : undefined,
                reverse: has( input.images, 'reverse' ) ? str( input.images!.reverse ) : undefined,
                other: has( input.images, 'other' ) ? input.images!.other!.filter( Boolean ).map( String ) : undefined
            };
        }

        return out;
    }

    public async initDb () : Promise< void > {
        try {
            this.adapter = new JSONFile< Database >( this.dbFile );
            this.db = new Low< Database >( this.adapter, this.defaultData() );

            await this.db.read();
        } catch ( err ) {
            throw Error( 'DB not initialized', { cause: err } );
        }
    }

    public async resetDb () : Promise< void > {
        if ( ! this.db ) await this.initDb();
        this.db!.data = this.defaultData();
        await this.flush();
    }

    public async setCurrency ( cur: string ) : Promise< void > {
        if ( ! this.db ) await this.initDb();
        this.db!.data._meta.currency = cur.trim();
        await this.flush();
    }

    public async getCurrency () : Promise< string > {
        if ( ! this.db ) await this.initDb();
        return this.db!.data._meta.currency;
    }

    public async exportCatalog ( asJson: boolean = false ) : Promise< string | Database > {
        if ( ! this.db ) await this.initDb();
        return asJson ? JSON.stringify( this.db!.data ) : this.db!.data;
    }

    public async getMetaData () : Promise< Database[ '_meta' ] > {
        if ( ! this.db ) await this.initDb();
        return this.db!.data._meta;
    }

    public async getSchemaVersion () : Promise< string > {
        return ( await this.getMetaData() ).schemaVersion;
    }

    public async getDateCreatedAt () : Promise< Date > {
        return new Date( ( await this.getMetaData() ).createdAt );
    }

    public async getDateUpdatedAt () : Promise< Date > {
        return new Date( ( await this.getMetaData() ).updatedAt );
    }

    public async getAllCoins () : Promise< Coin[] > {
        if ( ! this.db ) await this.initDb();
        return this.db!.data.coins.slice();
    }

    public async getCoinById ( id: string ) : Promise< Coin | undefined > {
        if ( ! this.db ) await this.initDb();
        return this.db!.data.coins.find( c => c.id === id );
    }

    public async createCoin ( input: PartialCoinInput ) : Promise< Coin > {
        if ( ! this.db ) await this.initDb();

        const now = new Date().toISOString();
        const validated = this.sanitizeAndValidateInput( input, true );
        const coin: Coin = {
            id: uuidv4(), createdAt: now, updatedAt: now,
            ...deepmerge( { tags: [], amount: 1, omv: [] }, validated )
        } as Coin;

        this.db!.data.coins.push( coin );
        await this.updateDb();
        return coin;
    }

    public async updateCoin ( id: string, updates: PartialCoinInput ) : Promise< Coin | undefined > {
        const coin = await this.getCoinById( id );
        if ( ! coin ) return;

        const validated = this.sanitizeAndValidateInput( updates, false );
        const merged = deepmerge( coin, validated, {
            arrayMerge: ( _, s ) => s,
            customMerge: () => ( a, b ) => b === null ? null : b ?? a
        } );

        Object.assign( coin, merged, { updatedAt: new Date().toISOString() } );
        await this.updateDb();
        return coin;
    }

    public async deleteCoin ( id: string ) : Promise< boolean > {
        if ( ! this.db ) await this.initDb();

        const idx = this.db!.data.coins.findIndex( c => c.id === id );
        if ( idx === -1 ) return false;

        this.db!.data.coins.splice( idx, 1 );
        await this.updateDb();
        return true;
    }

    public async searchCatalog ( query: {
        text?: string; filters?: Record< string, any >;
        range?: Record< string, { min?: number; max?: number } >;
        pagination?: { limit?: number; offset?: number };
    } ) : Promise< { result: Coin[]; total: number; } > {
        if ( ! this.db ) await this.initDb();
        const coins = this.db!.data.coins;
        const text = query.text?.toLowerCase().trim();

        // filter
        let result = coins.filter( coin => {
            if ( text ) {
                if ( ! [ coin.name, coin.description, coin.note, coin.series, coin.design?.obverse,
                    coin.design?.reverse, coin.design?.edge, ...( coin.tags ?? [] )
                ].filter( Boolean ).join( ' ' ).toLowerCase().includes( text ) ) return false;
            }

            if ( query.filters ) {
                for ( const [ k, v ] of Object.entries( query.filters ) ) {
                    if ( v == null ) continue;
                    const val = this.getNestedValue( coin as any, k );

                    if ( Array.isArray( v ) ) {
                        if ( ! Array.isArray( val ) ) return false;
                        if ( ! v.every( ( it: any ) => val.includes( it ) ) ) return false;
                    } else if ( typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ) {
                        if ( String( val ).toLowerCase() !== String( v ).toLowerCase() ) return false;
                    } else {
                        if ( val !== v ) return false;
                    }
                }
            }

            if ( query.range ) {
                for ( const [ k, r ] of Object.entries( query.range ) ) {
                    const val = this.getNestedValue( coin as any, k );
                    const num = typeof val === 'number' ? val : Number( val );
                    if ( Number.isNaN( num ) ) return false;
                    if ( r.min != null && num < r.min ) return false;
                    if ( r.max != null && num > r.max ) return false;
                }
            }

            return true;
        } );

        const total = result.length;

        // paginate
        if ( query.pagination?.limit ) {
            const offset = query.pagination?.offset ?? 0;
            result = result.slice( offset, offset + query.pagination?.limit );
        }

        return { result, total };
    }

    public async getStats ( update: boolean = false ) : Promise< CoinStats > {
        if ( ! this.db ) await this.initDb();

        if ( update ) await this.updateDb();
        return this.db!.data.stats;
    }

    public async computeStats () : Promise< CoinStats > {
        if ( ! this.db ) await this.initDb();
        const coins = this.db!.data.coins;
        const stats: CoinStats = this.defaultData().stats;
        let first = Infinity;

        for ( const c of coins ) {
            if ( ! DatabaseService.validStatus.includes( c.status ) ) continue;

            const amount = c.amount || 1;
            let purchase: number | undefined, omv: number | undefined;
            stats.totalCoins += amount;

            if ( c.purchase?.value ) stats.totalPurchase += ( purchase = c.purchase.value * amount );

            if ( c.omv?.length ) stats.totalOmv += ( omv = c.omv[ 0 ].value * amount );
            else if ( purchase ) stats.totalOmv += ( omv = purchase );

            if ( c.dimension?.weight ) stats.totalWeight += c.dimension.weight * amount;

            const updateStats = ( obj: keyof CoinStats, key: string ) => {
                ( stats as any )[ obj ][ key ] ??= { coins: 0, purchase: 0, omv: 0 } as CoinStatsItem;

                ( stats as any )[ obj ][ key ].coins += amount;
                ( stats as any )[ obj ][ key ].purchase += purchase;
                ( stats as any )[ obj ][ key ].omv += omv;
            };

            c.type && updateStats( 'type', c.type );
            c.status && updateStats( 'status', c.status );
            c.grade && updateStats( 'grade', c.grade );
            c.country && updateStats( 'country', c.country );
            c.currency && updateStats( 'currency', c.currency );

            if ( c.purchase?.date ) {
                const date = new Date( c.purchase.date );
                updateStats( 'year', date.getFullYear().toString() );
                first = Math.min( first, date.getTime() );
            }
        }

        stats.growth = Number( ( stats.totalOmv / stats.totalPurchase * 100 ).toFixed( 2 ) );
        stats.collectionAge = new Date( first ).toISOString();
        this.db!.data.stats = stats;
        return stats;
    }

    public async getValue ( update: boolean = false ) : Promise< CoinStatsRecord > {
        if ( ! this.db ) await this.initDb();

        if ( update ) await this.updateDb();
        return this.db!.data.value;
    }

    public async calculateValue () : Promise< CoinStatsRecord > {
        if ( ! this.db ) await this.initDb();

        const endOfYear = ( year: number ): number => Date.UTC( year, 11, 31, 23, 59, 59, 999 );

        const value: CoinStatsRecord = {};
        const preparedCoins = [];
        const years = new Set< number >();

        for ( const c of this.db!.data.coins ) {
            if ( ! DatabaseService.validStatus.includes( c.status ) ) continue;

            const purchaseTime = c.purchase?.date ? Date.parse( c.purchase.date ) : undefined;
            const amount = c.amount ?? 1;

            const omv = c.omv
                .map( o => ( { time: Date.parse( o.date ), value: o.value } ) )
                .sort( ( a, b ) => a.time - b.time );

            if ( purchaseTime ) years.add( new Date( purchaseTime ).getUTCFullYear() );
            for ( const o of omv ) years.add( new Date( o.time ).getUTCFullYear() );

            const firstKnownTime = Math.min(
                ...( purchaseTime !== undefined ? [ purchaseTime ] : [] ),
                ...omv.map( o => o.time )
            );

            if ( ! Number.isFinite( firstKnownTime ) ) continue;

            preparedCoins.push( {
                amount, firstKnownTime, purchaseTime, omv, omvIndex: 0,
                currentOmv: c.purchase?.value ?? 0,
                purchaseValue: c.purchase?.value
            } );
        }

        let coinsCount = 0;
        let purchaseSum = 0;
        let omvSum = 0;

        for ( const year of Array.from( years ).sort( ( a, b ) => a - b ) ) {
            const cutoff = endOfYear(year);

            for ( const coin of preparedCoins ) {
                if ( coin.firstKnownTime > cutoff ) continue;

                if ( coin.firstKnownTime <= cutoff && coin.firstKnownTime > endOfYear( year - 1 ) ) {
                    if ( coin.purchaseTime !== undefined ) purchaseSum += coin.purchaseValue! * coin.amount;
                    coinsCount += coin.amount;
                    omvSum += coin.currentOmv * coin.amount;
                }

                while ( coin.omvIndex < coin.omv.length && coin.omv[ coin.omvIndex ].time <= cutoff ) {
                    const nextOmv = coin.omv[ coin.omvIndex ].value;
                    omvSum += ( nextOmv - coin.currentOmv ) * coin.amount;
                    coin.currentOmv = nextOmv;
                    coin.omvIndex++;
                }
            }

            value[ String( year ) ] = {
                coins: coinsCount,
                purchase: Number( purchaseSum.toFixed( 2 ) ),
                omv: Number( omvSum.toFixed( 2 ) )
            };
        }

        this.db!.data.value = value;
        return value;
    }

    public async updateDb () : Promise< void > {
        await this.computeStats();
        await this.calculateValue();
        this.scheduleWrite();
    }

    public static getInstance () : DatabaseService {
        return DatabaseService.instance ||= new DatabaseService();
    }

}

const DB = DatabaseService.getInstance();
DB.initDb();

export default DB;
