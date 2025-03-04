import { ByteArrayOutputStream } from "../basic/ByteArrayOutputStream";
export declare class PngImage {
    private readonly width;
    private readonly height;
    private data;
    constructor(width: number, height: number);
    private getLZ77Raster;
    setPixel(x: number, y: number, pixel: number): void;
    write(out: ByteArrayOutputStream, blackColor?: string, whiteColor?: string): void;
}
export declare function createPngTag(width: number, height: number, getPixel: (x: number, y: number) => 0 | 1, black: string, white: string): string;
