import { v4 as uuidv4 } from 'uuid';
import type { DeviceSession, SessionRole } from '../../../shared/types';


export class DeviceService {

    private static readonly SESSION_TIMEOUT = 1000 * 60 * 60 * 24;

    private static instance: DeviceService;
    private sessions: Map< string, DeviceSession > = new Map();

    private constructor () {
        setInterval( this.cleanupOldSessions.bind( this ), 1000 * 60 * 15 );
    }

    private cleanupOldSessions () : void {
        const now = Date.now();

        for ( const [ id, session ] of this.sessions.entries() ) {
            if ( now - session.createdAt > DeviceService.SESSION_TIMEOUT ) {
                this.sessions.delete( id );
                console.log( `[DeviceService] Cleaned up timestamped-out session ${id}` );
            }
        }
    }

    public createSession ( desktopSocketId: string ) : string {
        const sessionId = uuidv4();
        this.sessions.set( sessionId, {
            id: sessionId,
            desktopSocketId: desktopSocketId,
            mobileSocketId: undefined,
            createdAt: Date.now()
        } );

        console.log( `[DeviceService] Created session ${sessionId} for desktop ${desktopSocketId}` );
        return sessionId;
    }

    public joinSession ( sessionId: string, socketId: string, role: SessionRole = 'mobile' ) : boolean {
        const session = this.sessions.get( sessionId );
        if ( ! session ) return false;

        switch ( role ) {
            case 'desktop':
                session.desktopSocketId = socketId;
                console.log( `[DeviceService] Desktop ${socketId} rejoined session ${sessionId}` );
                break;
            case 'mobile':
                session.mobileSocketId = socketId;
                console.log( `[DeviceService] Mobile ${socketId} joined session ${sessionId}` );
        }

        return true;
    }

    public getCounterpartSocketId ( socketId: string ) : string | undefined {
        for ( const session of this.sessions.values() ) {
            if ( session.desktopSocketId === socketId ) return session.mobileSocketId;
            if ( session.mobileSocketId === socketId ) return session.desktopSocketId;
        }
    }

    public removeSocket ( socketId: string ) : void {
        for ( const [ id, session ] of this.sessions.entries() ) {
            if ( session.desktopSocketId === socketId ) {
                session.desktopSocketId = undefined;
                console.log( `[DeviceService] Desktop disconnected from session ${id}` );
            } else if ( session.mobileSocketId === socketId ) {
                session.mobileSocketId = undefined;
                console.log( `[DeviceService] Mobile disconnected from session ${id}` );
            }
        }
    }

    public static getInstance () : DeviceService {
        return DeviceService.instance ||= new DeviceService();
    }

}
