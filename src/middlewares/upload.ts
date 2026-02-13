import { join, extname } from 'node:path';

import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const uploadsDir = join( process.cwd(), 'uploads' );

const storage = multer.diskStorage( {
    destination: uploadsDir,
    filename: ( _req, file, cb ) => {
        const ext = extname( file.originalname ) || `.${ file.mimetype.split( '/' )[ 1 ] || 'bin' }`;
        cb( null, `${ uuidv4() }${ext}` );
    }
} );

export const upload = multer( {
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: ( _req, file, cb ) => {
        if ( file.mimetype.startsWith( 'image/' ) ) cb( null, true );
        else cb( new Error( 'Only image files are allowed' ) );
    }
} );
