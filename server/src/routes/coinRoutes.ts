import { Router } from 'express';
import { CoinController } from '../controllers/CoinController';
import { ImageController } from '../controllers/ImageController';


const router = Router();
const coinController = new CoinController();
const imageController = new ImageController();

router.get( '/', coinController.getAllCoins );
router.get( '/:id', coinController.getCoin );
router.post( '/', coinController.createCoin );
router.put( '/:id', coinController.updateCoin );
router.delete( '/', coinController.deleteAllCoins );
router.delete( '/:id', coinController.deleteCoin );

router.post( '/upload', imageController.uploadImage );

export default router;
