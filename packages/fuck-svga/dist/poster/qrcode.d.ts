export interface QRCode {
    addData: (data: string) => void;
    isDark: (row: number, col: number) => boolean;
    getModuleCount: () => number;
    make: () => void;
    createTableTag: (cellSize: number, margin: number) => string;
    createImgTag: (cellSize: number, margin: number, size: number, black: string, white: string) => string;
}
/**
 * qrcode
 * @param typeNumber 1 to 40
 * @param errorCorrectLevel 'L','M','Q','H'
 */
declare const qrcode: {
    (typeNumber: number, errorCorrectLevel: "L" | "M" | "Q" | "H"): QRCode;
    stringToBytes(s: string): any[];
    createStringToBytes(unicodeData: any, numChars: number): (s: string) => any[];
};
export declare const createQrCodeImg: (text: string, options: {
    size?: number;
    typeNumber?: number;
    errorCorrectLevel?: "L" | "M" | "Q" | "H";
    black: string;
    white: string;
}) => string;
export { qrcode };
