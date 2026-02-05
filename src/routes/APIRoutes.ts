import { Router } from 'express';
import { CoinController } from '../controllers/CoinController';

const apiRoutes = Router();
const cc = new CoinController();

apiRoutes.get( '/coin/meta', cc.getMeta.bind( cc ) );
apiRoutes.get( '/coin/modified', cc.lastModified.bind( cc ) );
apiRoutes.get( '/currency', cc.getCurrency.bind( cc ) );
apiRoutes.post( '/currency', cc.setCurrency.bind( cc ) );

apiRoutes.get( '/coin/stats', cc.getStats.bind( cc ) );
apiRoutes.get( '/coin/value', cc.getValue.bind( cc ) );

apiRoutes.get( '/coin/export', cc.export.bind( cc ) );
apiRoutes.delete( '/coin/reset', cc.reset.bind( cc ) );

apiRoutes.get( '/coin/all', cc.getAllCoins.bind( cc ) );
apiRoutes.get( '/coin/search', cc.searchCatalog.bind( cc ) );

apiRoutes.get( '/coin/:id/get', cc.getCoin.bind( cc ) );
apiRoutes.put( '/coin/:id/update', cc.updateCoin.bind( cc ) );
apiRoutes.delete( '/coin/:id/delete', cc.deleteCoin.bind( cc ) );
apiRoutes.post( '/coin/add', cc.createCoin.bind( cc ) );

export { apiRoutes };
