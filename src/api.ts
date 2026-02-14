import { Router } from 'express';
import { CoinService } from './services/CoinService';

const api = Router();
const service = new CoinService();

api.post( '/base/add', service.addCoinBase.bind( service ) );

export { api };
