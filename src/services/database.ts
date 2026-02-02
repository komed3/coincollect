import { join } from 'node:path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { Coin, Database } from '../types';

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

    public static getInstance () : DatabaseService {
        return DatabaseService.instance ||= new DatabaseService();
    }

}

const DB = DatabaseService.getInstance();
DB.initDb();

export default DB;
