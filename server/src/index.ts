import { createServer } from 'node:http';
import { networkInterfaces } from 'node:os';
import { join } from 'node:path';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import { Server } from 'socket.io';
import coinRoutes from './routes/coinRoutes';
import settingsRoutes from './routes/settingsRoutes';
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

// Middleware
app.use( cors() );
app.use( express.urlencoded( { limit: '50mb', extended: true } ) );
app.use( express.json( { limit: '50mb' } ) );
app.use( '/images', express.static( join( __dirname, '../data/images' ) ) );

// Routes
app.use( '/api/coins', coinRoutes );
app.use( '/api/settings', settingsRoutes );

app.get( '/api/status', ( _: Request, res: Response ) => {
    res.json( { status: 'online', version: '0.1.0-alpha' } );
} );

app.get( '/api/ip', ( _: Request, res: Response ) => {
    const interfaces = networkInterfaces();
    let ip = 'localhost';

    for ( const devName in interfaces ) {
        const iface = interfaces[ devName ];

        for ( let i = 0; i < ( iface ?? [] ).length; i++ ) {
            const alias = iface![ i ];

            if ( alias.family === 'IPv4' && alias.address !== '127.0.0.1' && ! alias.internal ) {
                ip = alias.address;
                break;
            }
        }
    }

    res.json( { ip } );
} );
