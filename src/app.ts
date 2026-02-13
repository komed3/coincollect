import { join } from 'node:path';
import express, { type Response, static as serveStatic } from 'express';

import { i18n } from './middlewares/i18n';
import { api } from './api';
import { routes } from './routes';


// express app
const cwd = process.cwd();
const app = express();

// view engine
app.set( 'views', join( cwd, 'views' ) );
app.set( 'view engine', 'pug' );

// middleware
app.use( express.json() );
app.use( express.urlencoded( { extended: true } ) );
app.use( i18n );

// serve static files
app.use( '/fonts', serveStatic( join( cwd, 'public/fonts' ) ) );
app.use( '/js', serveStatic( join( cwd, 'public/js' ) ) );
app.use( '/css', serveStatic( join( cwd, 'public/css' ) ) );
app.use( '/images', serveStatic( join( cwd, 'public/images' ) ) );
app.use( '/uploads', serveStatic( join( cwd, 'uploads' ) ) );

// mount routes
app.use( '/api', api );
app.use( '/', routes );

// handle unknown paths
app.get( '/{*splat}', ( _, res: Response ) => res.redirect( '/' ) );

// listen ...
app.listen( 3001 );
