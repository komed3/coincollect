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

    public static getInstance () : DatabaseService {
        return DatabaseService.instance ||= new DatabaseService();
    }

}

export const DB = DatabaseService.getInstance();
