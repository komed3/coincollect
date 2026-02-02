export enum CoinType {
    Circulation = 'circulation',
    Commemorative = 'Commemorative',
    Bullion = 'bullion',
    Medal = 'medal',
    Pattern = 'pattern',
    Ingot = 'ingot',
    Stamp = 'stamp',
    Other = 'other'
}

export enum CoinShape {
    Round = 'round',
    Oval = 'oval',
    Square = 'square',
    Polygonal = 'polygonal',
    Irregular = 'irregular',
    Other = 'other'
}

export enum CoinGrade {
    G = 'G',
    VG = 'VG',
    F = 'F',
    VF = 'VF',
    XF = 'XF',
    UNC = 'UNC',
    BU = 'BU',
    FDC = 'FDC'
}

export interface Coin {
    id: string;
    name: string;

    type: CoinType;
    country?: string;
    series?: string;
    tags?: string[];

    grade: CoinGrade;
    amount?: number;

    mint?: {
        year?: number;
        mark?: string;
        mintage?: number;
    };

    nominalValue?: {
        value: number;
        currency?: string;
    };

    design?: {
        shape?: CoinShape;
    };
}
