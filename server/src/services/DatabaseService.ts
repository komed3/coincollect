import { ensureDirSync, existsSync, writeJsonSync } from 'fs-extra';
import { dirname, join } from 'path';

import { Coin, DatabaseSchema } from '../../../shared/types';

const DB_PATH = join( __dirname, '../../data/db.json' );
const INITIAL_DB: DatabaseSchema = {
    meta: {
        version: '1.0',
        lastExport: new Date().toISOString()
    },
    settings: {
        currency: 'EUR',
        language: 'de'
    },
    coins: []
};

export class DatabaseService {

    private static instance: DatabaseService;
    private data: DatabaseSchema | undefined = undefined;

    private constructor () {
        this.ensureDbExists();
    }

    private ensureDbExists () : void {
        if ( ! existsSync( DB_PATH ) ) {
            ensureDirSync( dirname( DB_PATH ) );
            writeJsonSync( DB_PATH, INITIAL_DB, { spaces: 2 } );
            console.log( 'Created new database file at', DB_PATH );
        }
    }

    public static getInstance () : DatabaseService {
        return DatabaseService.instance ||= new DatabaseService();
    }

}
