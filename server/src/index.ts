import { createServer } from 'node:http';
import { join } from 'node:path';
import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';
import { DeviceService } from './services/DeviceSession';


const app = express();
const httpServer = createServer( app );

const io = new Server( httpServer, {
    cors: {
        origin: '*',
        methods: [ 'GET', 'POST', 'PUT', 'DELETE' ]
    },
    maxHttpBufferSize: 5e7,
    pingTimeout: 600000,
    pingInterval: 25000,
    connectTimeout: 600000
} );

const deviceService = DeviceService.getInstance();
const PORT = process.env.PORT || 3001;

app.use( cors() );
app.use( express.urlencoded( { limit: '50mb', extended: true } ) );
app.use( express.json( { limit: '50mb' } ) );
app.use( '/images', express.static( join( __dirname, '../data/images' ) ) );
