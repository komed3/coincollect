import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import deepmerge from 'deepmerge';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { v4 as uuidv4 } from 'uuid';
import { Coin, CoinGrade, CoinShape, CoinStats, CoinStatsItem, CoinStatus, CoinType, Database } from '../types';

const __dirname = dirname( fileURLToPath( import.meta.url ) );

type PartialCoinInput = Partial< Omit< Coin, 'id' | 'createdAt' | 'updatedAt' > >;

export class DatabaseService {

    private static instance: DatabaseService;

    private dbFile: string;
    private adapter: JSONFile< Database > | undefined;
    private db: Low< Database > | undefined;
    private writeTimer: NodeJS.Timeout | undefined;
    private writeDelay = 150;

    private constructor () {
        this.dbFile = join( __dirname, '../../db/db.json' );
    }

    private defaultData () : Database {
        const now = new Date().toISOString();

        return {
            _meta: {
                schemaVersion: 1,
                createdAt: now,
                updatedAt: now
            },
            coins: [],
            stats: {
                totalCoins: 0,
                totalPurchase: 0,
                totalOmv: 0,
                type: {},
                grade: {},
                country: {},
                currency: {},
                year: {}
            }
        };
    }

    private scheduleWrite ( immediate = false ) : void {
        if ( ! this.db ) return;
        if ( this.writeTimer ) clearTimeout( this.writeTimer );
        if ( immediate ) { this.flush(); return }
        this.writeTimer = setTimeout( () => this.flush(), this.writeDelay );
    }

    private async flush () : Promise< void > {
        if ( ! this.db ) return;
        this.db.data._meta.updatedAt = new Date().toISOString();
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

    private sanitizeAndValidateInput ( input: PartialCoinInput, creating = false ) : PartialCoinInput & {
        name: string; type: CoinType; grade: CoinGrade; status: CoinStatus
    } {
        const out: any = {};

        if ( input.name ) out.name = String( input.name ).trim();
        else if ( creating ) throw new Error( 'Name is required' );

        if ( input.type ) out.type = input.type as CoinType;
        else if ( creating ) out.type = 'other' as CoinType;

        if ( input.grade ) out.grade = input.grade as CoinGrade;
        else if ( creating ) out.grade = 'unc' as CoinGrade;

        if ( input.status ) out.status = input.status as CoinStatus;
        else if ( creating ) out.status = 'owned' as CoinStatus;

        if ( input.country ) out.country = String( input.country ).trim();
        if ( input.series ) out.series = String( input.series ).trim();
        if ( input.tags ) out.tags = input.tags.filter( Boolean ).map( String );
        if ( input.amount ) out.amount = Number( input.amount );
        if ( input.description ) out.description = String( input.description ).trim();
        if ( input.note ) out.note = String( input.note ).trim();

        if ( input.mint ) {
            out.mint = {};
            if ( input.mint.year ) out.mint.year = Number( input.mint.year );
            if ( input.mint.mark ) out.mint.mark = String( input.mint.mark ).trim();
            if ( input.mint.issueDate ) out.mint.issueDate = new Date( input.mint.issueDate ).toISOString();
            if ( input.mint.mintage ) out.mint.mintage = Number( input.mint.mintage );
        }

        if ( input.nominalValue?.value && input.nominalValue?.unit ) {
            out.nominalValue = {
                value: Number( input.nominalValue?.value ),
                unit: String( input.nominalValue?.unit ).trim()
            };

            if ( input.nominalValue.currency ) out.nominalValue.currency = String( out.nominalValue.currency ).trim();
        }

        if ( input.design ) {
            out.mint = {};
            if ( input.design.shape ) out.design.shape = input.design.shape as CoinShape;
            if ( input.design.obverse ) out.design.obverse = String( input.design.obverse ).trim();
            if ( input.design.reverse ) out.design.reverse = String( input.design.reverse ).trim();
            if ( input.design.edge ) out.design.edge = String( input.design.edge ).trim();
        }

        if ( input.material?.length ) out.material = input.material.filter( Boolean ).map( m => ( {
            name: String( m.name ).trim(),
            fineness: m.fineness ? Number( m.fineness ) : undefined,
            portion: Number( m.portion ?? 100 )
        } ) );

        if ( input.dimensions ) {
            out.dimensions = {};

            if ( input.dimensions.diameter ) out.dimensions.diameter = Number( input.dimensions.diameter );
            if ( input.dimensions.thickness ) out.dimensions.thickness = Number( input.dimensions.thickness );
            if ( input.dimensions.weight ) out.dimensions.weight = Number( input.dimensions.weight );
        }

        if ( input.purchase?.value ) {
            out.purchase = { value: Number( input.purchase.value ) };
            if ( input.purchase.date ) out.purchase.date = new Date( input.purchase.date ).toISOString();
        }

        if ( input.omv?.length ) out.omv = input.omv.filter( Boolean ).map( o => ( {
            value: Number( o.value ), date: new Date( o.date ).toISOString()
        } ) );

        if ( input.images ) {
            out.images = {};

            if ( input.images.obverse ) out.images.obverse = String( input.images.obverse ).trim();
            if ( input.images.reverse ) out.images.reverse = String( input.images.reverse ).trim();
            if ( input.images.other ) out.images.other = input.images.other.filter( Boolean ).map( String );
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

    public async exportCatalog ( asJson = true ) : Promise< string | Database > {
        if ( ! this.db ) await this.initDb();
        return asJson ? JSON.stringify( this.db!.data, null, 2 ) : this.db!.data;
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
        this.computeStats();
        this.scheduleWrite();
        return coin;
    }

    public async updateCoin ( id: string, updates: PartialCoinInput ) : Promise< Coin | undefined > {
        const coin = await this.getCoinById( id );
        if ( ! coin ) return;

        const validated = this.sanitizeAndValidateInput( updates, false );
        Object.assign( coin, deepmerge( coin, validated ), { updatedAt: new Date().toISOString() } );
        this.computeStats();
        this.scheduleWrite();
        return coin;
    }

    public async deleteCoin ( id: string ) : Promise< boolean > {
        if ( ! this.db ) await this.initDb();

        const idx = this.db!.data.coins.findIndex( c => c.id === id );
        if ( idx === -1 ) return false;

        this.db!.data.coins.splice( idx, 1 );
        await this.computeStats();
        this.scheduleWrite();

        return true;
    }

    public async computeStats () : Promise< CoinStats > {
        if ( ! this.db ) await this.initDb();
        const coins = this.db!.data.coins;
        const stats: CoinStats = this.defaultData().stats;

        for ( const c of coins ) {
            const amount = c.amount || 1;
            let purchase: number, omv: number;
            stats.totalCoins += amount;

            if ( c.purchase?.value ) stats.totalPurchase += ( purchase = c.purchase.value * amount );
            if ( c.omv?.length ) stats.totalOmv += ( omv = c.omv.reduce( ( p, n ) => p.date > n.date ? p : n ).value * amount );

            const updateStats = ( obj: keyof CoinStats, key: string ) => {
                ( stats as any )[ obj ][ key ] ??= { coins: 0, purchase: 0, omv: 0 } as CoinStatsItem;

                ( stats as any )[ obj ][ key ].coins += amount;
                ( stats as any )[ obj ][ key ].purchase += purchase;
                ( stats as any )[ obj ][ key ].omv += omv;
            };

            c.type && updateStats( 'type', c.type );
            c.grade && updateStats( 'grade', c.grade );
            c.country && updateStats( 'country', c.country );
            c.nominalValue?.currency && updateStats( 'currency', c.nominalValue.currency );
            c.purchase?.date && updateStats( 'year', new Date( c.purchase.date ).getFullYear().toString() );
        }

        this.db!.data.stats = stats;
        return stats;
    }

    public async searchCatalog ( query: {
        text?: string;
        filters?: Record< string, any >;
        range?: Record< string, { min?: number; max?: number } >;
    } ) : Promise< Coin[] > {
        if ( ! this.db ) await this.initDb();
        const coins = this.db!.data.coins;
        const text = query.text?.toLowerCase().trim();

        return coins.filter( coin => {
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
    }

    public static getInstance () : DatabaseService {
        return DatabaseService.instance ||= new DatabaseService();
    }

}

const DB = DatabaseService.getInstance();
DB.initDb();

export default DB;
