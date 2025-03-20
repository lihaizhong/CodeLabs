/**
 * QRCode实现
 * https://www.cnblogs.com/leestar54/p/15782929.html
 * @param typeNumber 1 to 40
 * @param errorCorrectLevel 'L','M','Q','H'
 */
export declare class QRCode {
    private readonly typeNumber;
    static stringToBytes(s: string): number[];
    /**
     * @param unicodeData base64 string of byte array.
     * [16bit Unicode],[16bit Bytes], ...
     * @param numChars
     */
    static createStringToBytes(unicodeData: string, numChars: number): (s: string) => number[];
    private readonly errorCorrectLevel;
    private modules;
    private moduleCount;
    private dataCache;
    private dataList;
    constructor(typeNumber: number, errorCorrectLevel: "L" | "M" | "Q" | "H");
    private makeImpl;
    private setupPositionProbePattern;
    private setupPositionAdjustPattern;
    private setupTimingPattern;
    private setupTypeInfo;
    private getBestMaskPattern;
    private setupTypeNumber;
    private createData;
    private mapData;
    private createBytes;
    isDark(row: number, col: number): boolean;
    addData(data: string): void;
    getModuleCount(): number;
    make(): void;
}
