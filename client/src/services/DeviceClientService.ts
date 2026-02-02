import { io, Socket } from 'socket.io-client';
import type { DeviceSessionCallback, SessionRole } from '../../../shared/types';

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

    // Session management

    public createSession ( onCreated: ( sessionId: string ) => void ) : void {
        if ( ! this.socket ) this.connect();

        this.socket?.emit( 'create-session' );
        this.socket?.once( 'session-created', ( { sessionId } ) => {
            localStorage.setItem( 'active_session_id', sessionId );
            onCreated( sessionId );
        } );
    }

    public joinSession ( sessionId: string, onResult: ( success: boolean ) => void, role: SessionRole = 'mobile' ) : void {
        if ( ! this.socket ) this.connect();

        this.socket?.emit( 'join-session', { sessionId, role } );
        this.socket?.once( 'joined-session', ( { success } ) => {
            if ( success && role === 'desktop' ) localStorage.setItem( 'active_session_id', sessionId );
            onResult( success );
        } );
    }

    public tryRestoreSession () {
        const savedId = localStorage.getItem( 'active_session_id' );
        if ( savedId ) {
            this.joinSession( savedId, ( success ) => {
                if ( success ) {
                    console.log( 'Session restored:', savedId );
                } else {
                    console.log( 'Session expired, clearing storage' );
                    localStorage.removeItem( 'active_session_id' );
                }
            }, 'desktop' );
        }
    }

}

export const deviceClient = new DeviceClientService();
