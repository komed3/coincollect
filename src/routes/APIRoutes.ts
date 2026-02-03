import { Router } from 'express';
import { CoinController } from '../controllers/CoinController';

const apiRoutes = Router();
const coinController = new CoinController();

apiRoutes.get( '/coin/meta', coinController.getMeta );
apiRoutes.get( '/coin/modified', coinController.lastModified );
apiRoutes.get( '/coin/stats', coinController.getStats );
apiRoutes.get( '/coin/export', coinController.export );
apiRoutes.get( '/coin/all', coinController.getAllCoins );
apiRoutes.get( '/coin/search', coinController.searchCatalog );
apiRoutes.get( '/coin/:id/get', coinController.getCoin );

apiRoutes.post( '/coin/add', coinController.createCoin );
apiRoutes.put( '/coin/:id/update', coinController.updateCoin );
apiRoutes.delete( '/coin/:id/delete', coinController.deleteCoin );

apiRoutes.delete( '/coin/reset', coinController.reset );

export { apiRoutes };
