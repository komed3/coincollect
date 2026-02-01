import { Router } from 'express';
import { SettingsController } from '../controllers/SettingsController';

const router = Router();
const settingsController = new SettingsController();

router.get( '/', settingsController.getSettings );
router.patch( '/', settingsController.updateSettings );

export default router;
