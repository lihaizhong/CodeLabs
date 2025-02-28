export interface RSBlockCount {
    totalCount: number;
    dataCount: number;
}
export declare class RSBlock {
    private getRSBlockTable;
    getRSBlocks(typeNumber: number, errorCorrectLevel: number): RSBlockCount[];
}
