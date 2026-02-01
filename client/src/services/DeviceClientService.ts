import { io, Socket } from 'socket.io-client';
import type { DeviceSessionCallback } from '../../../shared/types';

const SOCKET_URL = `http://${window.location.hostname}:3001`;

class DeviceClientService {

    private socket: Socket | null = null;

    public connect () : Socket {
        if ( ! this.socket ) {
            this.socket = io( SOCKET_URL, {
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: Infinity,
                timeout: 60 * 10 * 1000,
                transports: [ 'websocket', 'polling' ]
            } );

            this.socket.on( 'connect', () => {
                console.log( 'Connected to socket server:', this.socket?.id );
                this.tryRestoreSession();
            } );

            this.socket.on( 'disconnect', () => {
                console.log( 'Disconnected from socket server' );
            } );

            this.socket.on( 'reconnect', ( attNr ) => {
                console.log( 'Reconnected after', attNr, 'attempts' );
                this.tryRestoreSession();
            } );

            // Global listeners setup
            this.setupGlobalListeners();
        }

        return this.socket;
    }

    public disconnect () {
        if ( this.socket ) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

}

export const deviceClient = new DeviceClientService();
