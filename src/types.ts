export interface Database {
    _meta: {
        schemaVersion: '1';
        currency: string;
        createdAt: string;
        updatedAt: string;
    };
    collection: {
        coins: CoinBase[];
        items: SingleCoin[];
    };
    suggestions: Suggestions;
    value: CoinValue;
    stats: CoinStats;
}

export type SuggestionTypes = 'series' | 'country' | 'currency' | 'unit' | 'issuer' | 'catalog' | 'certifier' | 'mark';
export type Suggestions = Record< SuggestionTypes, string[] >;

export type CoinValue = Record< string, {
    coins: number;
    acquisition: number;
    value: {
        min: number;
        max: number;
        avg: number;
    };
    range: number;
    variance: number;
    change: number;
    percent: number;
    growth: number;
    ratio: number;
} >

export interface CoinStats {
    totalCoins: number;
    totalAcquisition: number;
    totalValue: {
        min: number;
        max: number;
        avg: number;
    };
    growth: number;
    totalWeight: number;
    collectionAge: string;
    type: { [ T in CoinType ]?: CoinStatsItem };
    status: { [ S in CoinStatus ]?: CoinStatsItem };
    grade: { [ G in CoinGrade ]?: CoinStatsItem };
    acquisition: { [ A in Acquisition ]?: CoinStatsItem };
    series: Record< string, CoinStatsItem >;
    country: Record< string, CoinStatsItem >;
    currency: Record< string, CoinStatsItem >;
    issuer: Record< string, CoinStatsItem >;
    mintMark: Record< string, CoinStatsItem >;
    year: Record< string, CoinStatsItem >;
    material: { [ M in CoinMaterial ]?: CoinStatsItem & {
        weight: number;
        pureWeight: number;
        fineness: number | undefined;
        portion: number;
    } };
}

export interface CoinStatsItem {
    coins: number;
    acquisition: number;
    value: number;
    growth: number;
}

export interface Meta {
    readonly id: string;
    createdAt: string;
    updatedAt: string;
}

export interface CoinBase extends Meta {
    name: string;
    description?: string;
    notes?: string;

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
    devaluationDate?: string;
    mintStartYear?: number;
    mintEndYear?: number;
    mintMarks?: string[];

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

    image?: {
        obverse?: string;
        reverse?: string;
        other?: string;
    };

    identifier?: {
        catalog: CoinCatalog | string;
        id: string;
    }[];
}

export interface SingleCoin extends Meta {
    readonly baseId: string;
    status: CoinStatus;
    certified: boolean;
    certIssuer?: string;
    certNumber?: string;
    amount: number;
    notes?: string;

    grade: CoinGrade;
    acquisition: {
        method: Acquisition;
        date: string;
        price?: number;
        notes?: string;
    };

    value: {
        date: string;
        min: number;
        max: number;
        avg: number;
    }[];

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

export enum CoinStatus {
    Owned = 'owned',
    Duplicate = 'duplicate',
    Missing = 'missing',
    Wanted = 'wanted',
    Ordered = 'ordered',
    ForSale = 'sale',
    Sold = 'sold'
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

export enum Acquisition {
    Purchase = 'purchase',
    Gift = 'gift',
    Inheritance = 'inheritance',
    Exchange = 'exchange',
    Found = 'found',
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
    Nickelsilver = 'nickelsilver',
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

export enum CoinCatalog {
    Muenzkatalog = 'muenzkatalog',
    Numista = 'numista'
}

export interface CoinListItem {
    coin: SingleCoin;
    base: CoinBase;
}
