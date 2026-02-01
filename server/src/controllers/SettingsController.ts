import type { Request, Response } from 'express';
import { DatabaseService } from '../services/DatabaseService';

export class SettingsController {

    private dbService: DatabaseService;

    constructor () {
        this.dbService = DatabaseService.getInstance();
    }

    public async getSettings ( req: Request, res: Response ) : Promise< void > {
        try {
            const settings = await this.dbService.getSettings();
            res.json( settings );
        } catch ( error ) {
            res.status( 500 ).json( { error: 'Failed to fetch settings' } );
        }
    }

    public async updateSettings ( req: Request, res: Response ) : Promise< void > {
        try {
            const updatedSettings = await this.dbService.updateSettings( req.body );
            res.json( updatedSettings );
        } catch ( error ) {
            res.status( 500 ).json( { error: 'Failed to update settings' } );
        }
    }

}
