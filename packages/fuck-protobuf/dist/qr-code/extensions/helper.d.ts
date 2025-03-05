export interface ICreateQrCodeImgOptions {
    size?: number;
    typeNumber?: number;
    errorCorrectLevel?: "L" | "M" | "Q" | "H";
    black?: string;
    white?: string;
}
export declare function createQRCodeToGIF(text: string, options?: ICreateQrCodeImgOptions): string;
export declare function createQRCodeToPNG(text: string, options?: ICreateQrCodeImgOptions): string;
export declare function createQRCodeToHTML(text: string, options?: ICreateQrCodeImgOptions): string;
