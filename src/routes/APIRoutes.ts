import { Router } from 'express';
import { CoinController } from '../controllers/CoinController';

const apiRoutes = Router();
const coinController = new CoinController();

apiRoutes.get( '/coin/meta', coinController.getMeta );
apiRoutes.get( '/coin/modified', coinController.getLastModified );
apiRoutes.get( '/coin/stats', coinController.getStats );
apiRoutes.get( '/coin/all', coinController.getAllCoins );
apiRoutes.get( '/coin/search', coinController.searchCatalog );
apiRoutes.get( '/coin/get/:id', coinController.getCoin );

apiRoutes.post( '/coin/add', coinController.createCoin );
apiRoutes.put( '/coin/update/:id', coinController.updateCoin );

export { apiRoutes };
