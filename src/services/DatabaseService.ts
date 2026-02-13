import { join } from 'node:path';
import { Low } from 'lowdb';
import type { Database } from '../types';


const DATA_DIR = join( process.cwd(), 'data' );
const DB_PATH = join( DATA_DIR, 'db.json' );

export class DatabaseService {

    private static instance: DatabaseService;
    private db!: Low< Database >;

    private constructor () {}

    public static getInstance () : DatabaseService {
        return DatabaseService.instance ||= new DatabaseService();
    }

}
