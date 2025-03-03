import { ByteArrayOutputStream } from "../ByteArrayOutputStream";
export declare class PngImage {
    private signature;
    private parseChunk;
    write(out: ByteArrayOutputStream, blackColor?: string, whiteColor?: string): void;
}
