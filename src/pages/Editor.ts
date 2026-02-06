import type { Request, Response } from 'express';
import DB from '../services/DatabaseService';

export const editor = async ( req: Request, res: Response ) : Promise< void > => {
    const coin = req.params.id ? await DB.getCoinById( req.params.id as string ) : undefined;
    res.render( 'editor', { title: req.t( 'editor.title' ), mode: coin ? 'edit' : 'add', coin } );
};
