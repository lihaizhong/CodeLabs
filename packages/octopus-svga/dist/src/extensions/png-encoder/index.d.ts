export declare class PNGEncoder {
    private readonly width;
    private readonly height;
    private readonly view;
    private crc32;
    constructor(width: number, height: number);
    private createChunk;
    private createIHDRChunk;
    private createIDATChunk;
    private createIENDChunk;
    setPixel(x: number, y: number, pixel: number): void;
    write(pixels: Uint8Array | Uint8ClampedArray): this;
    flush(): Uint8Array;
}
