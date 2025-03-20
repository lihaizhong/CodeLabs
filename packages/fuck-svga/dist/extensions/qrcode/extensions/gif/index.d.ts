import { ByteArrayOutputStream } from "../basic/ByteArrayOutputStream";
export declare class GifImage {
    private readonly width;
    private readonly height;
    private data;
    constructor(width: number, height: number);
    private getLZWRaster;
    setPixel(x: number, y: number, pixel: number): void;
    write(out: ByteArrayOutputStream, blackColor?: string, whiteColor?: string): void;
}
export declare function createGifTag(width: number, height: number, getPixel: (x: number, y: number) => 0 | 1, black: string, white: string): string;
