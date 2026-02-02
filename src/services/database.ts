import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { Coin, CoinGrade, CoinStats, CoinStatsItem, CoinStatus, CoinType, Database } from '../types';

const __dirname = dirname ( fileURLToPath( import.meta.url ) );

type PartialCoinInput = Partial< Omit< Coin, 'id' | 'createdAt' | 'updatedAt' | 'omv' > > & {
    omv?: { value: number; date: string };
};

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

        if ( input.mint ) {
            out.mint = {};
            if ( input.mint.year ) out.mint.year = Number( input.mint.year );
            if ( input.mint.mark ) out.mint.mark = String( input.mint.mark ).trim();
            if ( input.mint.issueDate ) out.mint.issueDate = new Date( input.mint.issueDate ).toISOString();
            if ( input.mint.mintage ) out.mint.mintage = Number( input.mint.mintage );
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

    public static getInstance () : DatabaseService {
        return DatabaseService.instance ||= new DatabaseService();
    }

}

const DB = DatabaseService.getInstance();
DB.initDb();

export default DB;
