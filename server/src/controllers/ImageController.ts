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

    public async uploadImage ( req: Request, res: Response ) : Promise< void > {
        try {
            const { image } = req.body;

            if ( ! image ) {
                res.status( 400 ).json( { error: 'No image data provided' } );
                return;
            }

            console.log( `[ImageController] Upload request received. Size: ${
                Math.round( image?.length / 1024 )
            } KB`);

            const base64Data = image.replace( /^data:image\/\w+;base64,/, '' );
            const buffer = Buffer.from( base64Data, 'base64' );

            const fileName = `${ uuidv4() }.webp`;
            const filePath = join( this.uploadDir, fileName );

            await sharp( buffer ).resize( 1200, 1200, { fit: 'inside', withoutEnlargement: true } )
                .webp( { quality: 85 } ).toFile( filePath );

            const publicUrl = `/images/${fileName}`;
            res.status( 200 ).json( { url: publicUrl } );
        } catch ( error ) {
            console.error( '[ImageController] Error processing image:', error );
            res.status( 500 ).json( {
                error: 'Failed to process image',
                details: ( error as Error ).message
            } );
        }
    }

}
