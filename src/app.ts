import { join } from 'node:path';
import express from 'express';
import { apiRoutes } from './routes/APIRoutes';
import { I18nService } from './services/i18nService';

// Express app
const app = express();

// Set up view engine
app.set( 'views', join( process.cwd(), 'views' ) );
app.set( 'view engine', 'pug' );

// Middleware
app.use( express.urlencoded( { limit: '50mb', extended: true } ) );
app.use( express.json( { limit: '50mb' } ) );
app.use( I18nService );

// Mount routes
app.use( '/api', apiRoutes );

// Listen ...
const PORT = process.env.PORT || 3001;
app.listen( PORT );
