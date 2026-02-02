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

    description?: string;
    design?: {
        shape?: CoinShape;
        obverse?: string;
        reverse?: string;
        edge?: string;
    };

    dimensions?: {
        diameter?: number;
        thickness?: number;
        weight?: number;
    };

    material?: CoinMaterial[];

    createdAt: string;
    updatedAt: string;
}

export enum CoinType {
    Circulation = 'circulation',
    Commemorative = 'Commemorative',
    Bullion = 'bullion',
    Medal = 'medal',
    Pattern = 'pattern',
    Ingot = 'ingot',
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

export enum CoinShape {
    Round = 'round',
    Oval = 'oval',
    Square = 'square',
    Polygonal = 'polygonal',
    Irregular = 'irregular',
    Other = 'other'
}

export interface CoinMaterial {
    name: string;
    fineness?: number;
    portion?: number;
}
