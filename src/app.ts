import { join } from 'node:path';

import express from 'express';


// express app
const cwd = process.cwd();
const app = express();

// view engine
app.set( 'views', join( cwd, 'views' ) );
app.set( 'view engine', 'pug' );

// middleware
app.use( express.json() );
app.use( express.urlencoded( { extended: true } ) );

// listen ...
app.listen( 3001 );
