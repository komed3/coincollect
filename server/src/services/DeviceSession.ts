import type { DeviceSession } from '../../../shared/types';

export class DeviceService {

    private static readonly SESSION_TIMEOUT = 1000 * 60 * 60 * 24;

    private static instance: DeviceService;
    private sessions: Map< string, DeviceSession > = new Map();

    private constructor () {}

    public static getInstance () : DeviceService {
        return DeviceService.instance ||= new DeviceService();
    }

}
