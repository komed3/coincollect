import { Router } from 'express';

import { dashboard } from './pages/Dashboard';
import { baseEditor, coinEditor } from './pages/Editor';

const routes = Router();
routes.get( '{/}', dashboard );
routes.get( '/add/base{/}', baseEditor );
routes.get( '/add/coin{/}', coinEditor );
routes.get( '/base/:id/edit{/}', baseEditor );
routes.get( '/coin/:id/edit{/}', coinEditor );

export { routes };
