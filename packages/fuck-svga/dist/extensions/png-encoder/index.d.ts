export declare class PNGEncoder {
    private readonly width;
    private readonly height;
    private readonly view;
    private pngData;
    constructor(width: number, height: number);
    private createChunk;
    private createIHDRChunk;
    private createIDATChunk;
    private createIENDChunk;
    setPixel(x: number, y: number, pixel: number): void;
    flush(): void;
    toBuffer(): Uint8Array;
}
