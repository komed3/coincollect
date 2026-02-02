export interface AppSettings {
    currency: string;
    language: string;
}

export interface SettingsContextType {
    settings: AppSettings;
    loading: boolean;
    updateSettings: ( newSettings: Partial< AppSettings > ) => Promise< void >;
}

export interface DatabaseSchema {
    meta: {
        version: string;
        lastExport: string;
    };
    settings: AppSettings;
    coins: Coin[];
}

export interface Coin {
    id: string;
    name: string;

    type: CoinType;
    originCountry: string;
    series?: string;
    tags?: string[];

    mintYear?: number;
    mintage?: number;
    mintMark?: string;

    faceValue?: {
        amount: number;
        currency: string;
    };

    grade: CoinGrade;

    shape: CoinShape;
    material?: CoinMaterial[];
    dimensions?: {
        diameter?: number;
        thickness?: number;
        weight?: number;
    };

    description?: string;
    design?: {
        obverse?: string;
        reverse?: string;
        edge?: string;
    };

    purchaseInfo?: {
        price: number;
        currency: string;
        date?: string;
    };
    collectorValue: {
        amount: number;
        currency: string;
        lastUpdated?: string;
    };

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
    CommemorativeCirculation = 'commemorative_circulation',
    Commemorative = 'commemorative',
    Bullion = 'bullion',
    Medal = 'medal',
    Probetracking = 'probe',
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
    portionPct?: number;
}

export type DeviceSessionCallback = ( data: any ) => void;

export interface DeviceSession {
    id: string;
    desktopSocketId: string | undefined;
    mobileSocketId: string | undefined;
    createdAt: number;
}

export type SessionRole = 'desktop' | 'mobile';
