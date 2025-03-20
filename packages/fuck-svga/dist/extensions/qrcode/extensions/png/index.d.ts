import { ByteArrayOutputStream } from "../basic/ByteArrayOutputStream";
export declare class PngImage {
    private readonly width;
    private readonly height;
    private data;
    constructor(width: number, height: number);
    toInt8(num: number): ArrayBuffer;
    toInt32(num: number): ArrayBuffer;
    private addChunk;
    setPixel(x: number, y: number, pixel: number): void;
    write(out: ByteArrayOutputStream): void;
}
export declare function createPngTag(width: number, height: number, getPixel: (x: number, y: number) => number): string;
