export interface CoinBase {}

export interface SingleCoin {}

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
