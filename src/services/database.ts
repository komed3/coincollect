import { JSONFile } from 'lowdb/node';
import { Coin, Database } from '../types';

export class DatabaseService {

    private static instance: DatabaseService;

    private constructor () {}

    public static getInstance () : DatabaseService {
        return DatabaseService.instance ||= new DatabaseService();
    }

}
