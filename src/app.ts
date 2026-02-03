import { join } from 'node:path';
import express, { static as serveStatic } from 'express';
import { apiRoutes } from './routes/APIRoutes';
import { I18nService } from './services/i18nService';

// Express app
const cwd = process.cwd();
const app = express();

// Set up view engine
app.set( 'views', join( cwd, 'views' ) );
app.set( 'view engine', 'pug' );

// Middleware
app.use( express.urlencoded( { limit: '50mb', extended: true } ) );
app.use( express.json( { limit: '50mb' } ) );
app.use( I18nService );

// Serve static files
app.use( '/fonts', serveStatic( join( cwd, 'public/fonts' ) ) );
app.use( '/js', serveStatic( join( cwd, 'public/js' ) ) );
app.use( '/css', serveStatic( join( cwd, 'public/css' ) ) );
app.use( '/images', serveStatic( join( cwd, 'public/images' ) ) );

// Mount routes
app.use( '/api', apiRoutes );

// Listen ...
const PORT = process.env.PORT || 3001;
app.listen( PORT );
