import { Router } from 'express';
import { coin } from '../pages/Coin';
import { editor } from '../pages/Editor';
import { home } from '../pages/Home';
import { settings } from '../pages/Settings';
import { stats } from '../pages/Stats';

const appRoutes = Router();

appRoutes.get( '/', home );
appRoutes.get( '/coin/:id', coin );
appRoutes.get( '/add', editor );
appRoutes.get( '/settings', settings );
appRoutes.get( '/stats', stats );

export { appRoutes };
