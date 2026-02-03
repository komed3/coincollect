import { join } from 'node:path';
import express, { type Response, static as serveStatic } from 'express';
import { apiRoutes } from './routes/APIRoutes';
import { appRoutes } from './routes/AppRoutes';
import { formatter } from './services/FormatterService';
import { I18nService } from './services/I18nService';

// Express app
const cwd = process.cwd();
const app = express();

// Set up view engine
app.set( 'views', join( cwd, 'views' ) );
app.set( 'view engine', 'pug' );

// Middleware
app.use( express.json() );
app.use( express.urlencoded( { extended: true } ) );
app.use( I18nService );
app.use( formatter );

// Serve static files
app.use( '/fonts', serveStatic( join( cwd, 'public/fonts' ) ) );
app.use( '/js', serveStatic( join( cwd, 'public/js' ) ) );
app.use( '/css', serveStatic( join( cwd, 'public/css' ) ) );
app.use( '/images', serveStatic( join( cwd, 'public/images' ) ) );

// Mount routes
app.use( '/api', apiRoutes );
app.use( '/', appRoutes );

// Handle unknown paths
app.get( '/{*splat}', ( _, res: Response ) => res.redirect( '/' ) );

// Listen ...
const PORT = process.env.PORT || 3001;
app.listen( PORT );
