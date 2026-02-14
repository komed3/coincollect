import { Router } from 'express';

import { upload } from './middlewares/upload';
import { CoinService } from './services/CoinService';

const api = Router();
const service = new CoinService();

api.post( '/base/add', service.addCoinBase.bind( service ) );
api.put( '/base/:id/set', service.setCoinBase.bind( service ) );
api.post( '/base/:id/upload', upload.fields( [
    { name: 'obverse', maxCount: 1 },
    { name: 'reverse', maxCount: 1 },
    { name: 'other', maxCount: 1 }
] ), service.uploadImages.bind( service ) );

export { api };
