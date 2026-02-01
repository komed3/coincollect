import { createServer } from 'node:http';
import { networkInterfaces } from 'node:os';
import { join } from 'node:path';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import { Server } from 'socket.io';
import coinRoutes from './routes/coinRoutes';
import settingsRoutes from './routes/settingsRoutes';
import { DeviceService } from './services/DeviceSession';
import { SessionRole } from '../../shared/types';


// Setup server
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

// Socket.io Connection
io.on( 'connection', ( socket ) => {
    console.log( 'New client connected:', socket.id );

    socket.on( 'create-session', () => {
        const sessionId = deviceService.createSession( socket.id );
        socket.emit( 'session-created', { sessionId } );
    } );

    socket.on( 'join-session', ( { sessionId, role }: { sessionId: string, role?: SessionRole } ) => {
        const success = deviceService.joinSession( sessionId, socket.id, role );

        if ( success ) {
            socket.emit( 'joined-session', { success: true } );

            const xId = deviceService.getCounterpartSocketId( socket.id );
            if ( xId ) io.to( xId ).emit( 'device-connected', { counterpartSocketId: socket.id } );
        } else {
            socket.emit( 'joined-session', { success: false, error: 'Session invalid' } );
        }
    } );

    socket.on( 'relay-message', ( data: { type: string, payload: any } ) => {
        const tsId = deviceService.getCounterpartSocketId( socket.id );
        console.log( `[Relay] Type: ${data.type} from ${socket.id} to ${ tsId || 'NONE' }` );
        if ( tsId ) io.to( tsId ).emit( 'relay-message', data );
    } );

    socket.on( 'disconnect', () => {
        const xId = deviceService.getCounterpartSocketId( socket.id );
        if ( xId ) io.to( xId ).emit( 'device-disconnected' );

        deviceService.removeSocket( socket.id );
        console.log( 'Client disconnected:', socket.id );
    } );
} );

// Start Server with Port Retry
const startServer = ( port: number ) => {
    httpServer.removeAllListeners( 'listening' );
    httpServer.removeAllListeners( 'error' );

    const serverInstance = httpServer.listen( port, '0.0.0.0' );

    serverInstance.once( 'listening', () => {
        console.log( `[Server] SUCCESS: Running on port ${port}` );
        console.log( `[Server] Local: http://localhost:${port}` );

        const interfaces = networkInterfaces();

        for ( const devName in interfaces ) {
            const iface = interfaces[ devName ];

            for (let i = 0; i < ( iface ?? [] ).length; i++ ) {
                const alias = iface![ i ];

                if ( alias.family === 'IPv4' && alias.address !== '127.0.0.1' && ! alias.internal ) {
                    console.log( `[Server] Mobile Connection URL: http://${alias.address}:${port}` );
                }
            }
        }
    } );

    serverInstance.once( 'error', ( error: any ) => {
        if ( error.code === 'EADDRINUSE' ) {
            console.error( `[Server] Port ${port} is occupied by another process!` );
            console.log( `[Server] Please check if you have another terminal open with 'npm start'.` );
            console.log( `[Server] Retrying in 5s... (Waiting for manual cleanup or port release)` );

            setTimeout( () => {
                try { serverInstance.close() }
                catch { /** do nothing */ }
                startServer( port );
            }, 5000 );
        } else {
            console.error( '[Server] Fatal Error:', error );
        }
    } );
};

// Start with delay to let OS clean up
setTimeout( () => startServer( Number( PORT ) ), 1000 );

// Graceful Shutdown
const shutdown = () => {
    console.log( '[Server] Shutting down gracefully ...' );
    httpServer.close( () => {
        console.log( '[Server] Closed out remaining connections.' );
        process.exit( 0 );
    } );

    // Force shutdown after 5s
    setTimeout( () => {
        console.error( '[Server] Could not close connections in time, forcefully shutting down' );
        process.exit( 1 );
    }, 5000 );
};

process.on( 'SIGTERM', shutdown );
process.on( 'SIGINT', shutdown );
