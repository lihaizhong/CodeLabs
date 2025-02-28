import { ByteArrayOutputStream } from "../ByteArrayOutputStream";
export declare class PngImage {
    private signature;
    write(out: ByteArrayOutputStream, blackColor?: string, whiteColor?: string): void;
}
