export interface CoinBase {
    readonly id: string;
    name: string;
    description?: string;
    note?: string;

    type: CoinType;
    country?: string;
    series?: string;
    tags?: string[];

    currency?: string;
    nominal?: {
        value: string;
        unit?: string;
    };

    issuer?: string;
    issueDate?: string;

    design?: {
        shape?: CoinShape;
        obverse?: string;
        reverse?: string;
        edge?: string;
    };

    material?: {
        material: CoinMaterial;
        fineness?: number;
        portion?: number;
    }[];

    dimension?: {
        diameter?: number;
        thickness?: number;
        weight?: number;
    };
}

export interface SingleCoin {
    readonly id: string;
    refId: string;
    status: CoinStatus;
    amount: number;

    grade: CoinGrade;

    mintMark?: string;
    mintYear?: number;
    mintage?: number;
}

export enum CoinType {
    Circulation = 'circulation',
    SpecialCirculation = 'special',
    Commemorative = 'commemorative',
    Bullion = 'bullion',
    Banknote = 'banknote',
    Medal = 'medal',
    Temporary = 'temporary',
    Pattern = 'pattern',
    Ingot = 'ingot',
    Stamp = 'stamp',
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

export enum CoinStatus {
    Owned = 'owned',
    Duplicate = 'duplicate',
    Missing = 'missing',
    Wanted = 'wanted',
    Ordered = 'ordered',
    ForSale = 'sale',
    Sold = 'sold'
}

export enum CoinShape {
    Round = 'round',
    Oval = 'oval',
    Square = 'square',
    Polygonal = 'polygonal',
    Irregular = 'irregular',
    Other = 'other'
}

export enum CoinMaterial {
    Gold = 'gold',
    Silver = 'silver',
    Platinum = 'platinum',
    Palladium = 'palladium',
    Rhodium = 'rhodium',
    Ruthenium = 'ruthenium',
    Iridium = 'iridium',
    Osmium = 'osmium',
    Copper = 'copper',
    Bronze = 'bronze',
    Brass = 'brass',
    Cupronickel = 'cupronickel',
    Monel = 'monel',
    Aluminum = 'aluminum',
    Magnesium = 'magnesium',
    Titanium = 'titanium',
    Steel = 'steel',
    Stainless = 'stainless',
    Chrome = 'chrome',
    Nickel = 'nickel',
    Zinc = 'zinc',
    Tin = 'tin',
    Duralumin = 'duralumin',
    Iron = 'iron',
    Lead = 'lead',
    Cobalt = 'cobalt',
    Vanadium = 'vanadium',
    Molybdenum = 'molybdenum',
    Tungsten = 'tungsten',
    Inconel = 'inconel',
    Hastelloy = 'hastelloy',
    Mixed = 'mixed',
    Porcelain = 'porcelain',
    Ceramics = 'ceramics',
    Synthetic = 'synthetic',
    Unknown = 'unknown'
}
