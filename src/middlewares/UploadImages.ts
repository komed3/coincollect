import { join, extname } from 'node:path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const uploadsDir = join( process.cwd(), 'uploads' );
