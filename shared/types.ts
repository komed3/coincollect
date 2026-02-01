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

    grade: any;

    shape: any;
    material?: any;
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
    Circulation = 'Umlaufmünze',
    CommemorativeCirculation = 'Sonderumlaufmünze',
    Commemorative = 'Gedenkmünze',
    Bullion = 'Anlagemünze',
    Medal = 'Medaille',
    Probetracking = 'Probeprägung',
    Other = 'Sonstige'
}
