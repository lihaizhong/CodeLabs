import { QRCode } from "qr-code";
import { Polynomial } from "./polynomial";
export declare const Util: {
    getBCHTypeInfo(data: number): number;
    getBCHTypeNumber(data: number): number;
    getPatternPosition(typeNumber: number): number[];
    getMaskFunction(maskPattern: number): (i: number, j: number) => boolean;
    getErrorCorrectPolynomial(errorCorrectLength: number): Polynomial;
    getLengthInBits(mode: number, type: number): number;
    getLostPoint(qr: QRCode): number;
};
