export declare class CRC32 {
    private readonly buf;
    static table: Record<string, number[]> | null;
    constructor(buf: number[]);
    private signedCRCTable;
    private sliceBy16Tables;
    read(): number;
}
