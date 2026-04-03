import { Router } from 'express';

import { upload } from './middlewares/upload';
import { CoinService } from './services/CoinService';

const api = Router();
const service = new CoinService();

api.post( '/search', service.searchCoins.bind( service ) );

api.get( '/stats', service.getStats.bind( service ) );
api.get( '/value', service.getValue.bind( service ) );

api.post( '/base/add', service.addCoinBase.bind( service ) );
api.put( '/base/:id/set', service.setCoinBase.bind( service ) );
api.post( '/base/:id/upload', upload.fields( [
    { name: 'obverse', maxCount: 1 },
    { name: 'reverse', maxCount: 1 },
    { name: 'other', maxCount: 1 }
] ), service.uploadImages.bind( service ) );

api.post( '/coin/add', service.addSingleCoin.bind( service ) );
api.put( '/coin/:id/set', service.setSingleCoin.bind( service ) );

api.get( '/settings/unused-images', service.getUnusedImages.bind( service ) );
api.post( '/settings/cleanup-images', service.pruneUnusedImages.bind( service ) );

api.get( '/settings/export', service.exportDatabase.bind( service ) );
api.post( '/settings/refresh', service.refreshDatabase.bind( service ) );
api.post( '/settings/clear', service.clearDatabase.bind( service ) );

export { api };
