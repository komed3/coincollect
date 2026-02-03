import { Router } from 'express';
import { CoinController } from '../controllers/CoinController';

const coins = Router();
const coinController = new CoinController();

coins.get( '/all', coinController.getAllCoins );

export { coins };
