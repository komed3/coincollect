import { Router } from 'express';

import { dashboard } from './pages/Dashboard';
import { baseEditor, coinEditor } from './pages/Editor';
import { stats } from './pages/Stats';
import { baseView, coinView } from './pages/View';

const routes = Router();
routes.get( '{/}', dashboard );
routes.get( '/stats{/}', stats );

routes.get( '/base/:id{/}', baseView );
routes.get( '/coin/:id{/}', coinView );

routes.get( '/add/base{/}', baseEditor );
routes.get( '/add/coin{/}', coinEditor );
routes.get( '/base/:id/edit{/}', baseEditor );
routes.get( '/coin/:id/edit{/}', coinEditor );

export { routes };
