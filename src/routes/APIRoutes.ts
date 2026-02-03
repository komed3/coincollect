import { Router } from 'express';
import { CoinController } from '../controllers/CoinController';

const coins = Router();
const coinController = new CoinController();

coins.get( '/meta', coinController.getMeta );
coins.get( '/modified', coinController.getLastModified );
coins.get( '/stats', coinController.getStats );
coins.get( '/all', coinController.getAllCoins );
coins.get( '/search', coinController.searchCatalog );
coins.get( '/get/:id', coinController.getCoin );

export { coins };
