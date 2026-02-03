import { join } from 'node:path';
import express, { type NextFunction, type Request, static as serveStatic } from 'express';
import i18next from 'i18next';
import { apiRoutes } from './routes/APIRoutes';
import { appRoutes } from './routes/AppRoutes';
import { I18nService } from './services/i18nService';

// Express app
const cwd = process.cwd();
const app = express();

// Set up view engine
app.set( 'views', join( cwd, 'views' ) );
app.set( 'view engine', 'pug' );

// Middleware
app.use( express.urlencoded( { extended: true } ) );
app.use( express.json() );
app.use( I18nService );

app.use( ( req: Request, _, next: NextFunction ) => {
    req.language = i18next.language;
    req.t = i18next.t.bind( i18next );
    next();
} );

// Serve static files
app.use( '/fonts', serveStatic( join( cwd, 'public/fonts' ) ) );
app.use( '/js', serveStatic( join( cwd, 'public/js' ) ) );
app.use( '/css', serveStatic( join( cwd, 'public/css' ) ) );
app.use( '/images', serveStatic( join( cwd, 'public/images' ) ) );

// Mount routes
app.use( '/api', apiRoutes );
app.use( '/', appRoutes );

// Listen ...
const PORT = process.env.PORT || 3001;
app.listen( PORT );
