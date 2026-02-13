import { Router } from 'express';
import { dashboard } from './pages/Dashboard';

const routes = Router();
routes.get( '{/}', dashboard );

export { routes };
