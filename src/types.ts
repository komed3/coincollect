export interface Database {
    _meta: {
        schemaVersion: '1';
        createdAt: string;
        updatedAt: string;
    };
    coins: Coin[];
    stats: CoinStats;
}

export interface CoinStats {
    totalCoins: number;
    totalPurchase: number;
    totalOmv: number;
    type: { [ T in CoinType ]?: CoinStatsItem };
    grade: { [ G in CoinGrade ]?: CoinStatsItem };
    country: Record< string, CoinStatsItem >;
    currency: Record< string, CoinStatsItem >;
    year: Record< string, CoinStatsItem >;
}

export interface CoinStatsItem {
    coins: number;
    purchase: number;
    omv: number;
}

export interface Coin {
    id: string;
    name: string;

    type: CoinType;
    country?: string;
    series?: string;
    tags?: string[];

    grade: CoinGrade;
    status: CoinStatus;
    amount: number;

    mint?: {
        year?: number;
        mark?: string;
        issueDate?: string;
        mintage?: number;
    };

    nominalValue?: {
        value: number;
        unit: string;
        currency?: string;
    };

    description?: string;
    note?: string;
    design?: {
        shape?: CoinShape;
        obverse?: string;
        reverse?: string;
        edge?: string;
    };

    material?: CoinMaterial[];
    dimensions?: {
        diameter?: number;
        thickness?: number;
        weight?: number;
    };

    purchase?: {
        value: number;
        date?: string;
    };
    omv: {
        value: number;
        date: string;
    }[];

    images?: {
        obverse?: string;
        reverse?: string;
        other?: string[];
    };

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

export enum CoinStatus {
    Owned = 'owned',
    Duplicate = 'duplicate',
    Missing = 'missing',
    Wanted = 'wanted',
    Ordered = 'ordered',
    ForSale = 'forSale',
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

export interface CoinMaterial {
    name: string;
    fineness?: number;
    portion?: number;
}
