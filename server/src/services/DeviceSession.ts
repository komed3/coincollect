import { v4 as uuidv4 } from 'uuid';

import type { DeviceSession } from '../../../shared/types';

export class DeviceService {

    private static readonly SESSION_TIMEOUT = 1000 * 60 * 60 * 24;

    private static instance: DeviceService;
    private sessions: Map< string, DeviceSession > = new Map();

    private constructor () {}

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

    public static getInstance () : DeviceService {
        return DeviceService.instance ||= new DeviceService();
    }

}
