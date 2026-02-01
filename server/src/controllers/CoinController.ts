import { DatabaseService } from '../services/DatabaseService';

export class CoinController {

    private dbService: DatabaseService;

    constructor () {
        this.dbService = DatabaseService.getInstance();
    }

}
