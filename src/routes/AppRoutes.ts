import { Router } from 'express';
import { home } from '../pages/Home';

const appRoutes = Router();

appRoutes.get( '/', home );

export { appRoutes };
