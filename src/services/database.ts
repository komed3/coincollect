import { join } from 'node:path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { Database } from '../types';

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

    public async initDb () : Promise<void> {
        const now = new Date().toISOString();
        this.adapter = new JSONFile< Database >( this.dbFile );
        this.db = new Low< Database >( this.adapter, this.defaultData() );

        await this.db.read();
    }

    public static getInstance () : DatabaseService {
        return DatabaseService.instance ||= new DatabaseService();
    }

}

const DB = DatabaseService.getInstance();
DB.initDb();

export default DB;
