import { join } from 'node:path';
import type { Request, Response } from 'express';
import { ensureDirSync } from 'fs-extra';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export class ImageController {

    private readonly uploadDir = join( __dirname, '../../data/images' );

    constructor () {
        ensureDirSync( this.uploadDir );
    }

    public async uploadImage ( req: Request, res: Response ) : Promise< void > {}

}
