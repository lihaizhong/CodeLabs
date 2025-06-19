export interface IQrCodeImgOptions {
    /**
     * 二维码内容
     */
    code: string;
    /**
     * 二维码的大小
     */
    size: number;
    /**
     * 二维码的码元 二维码横向有多少个小点（1 - 40）
     */
    typeNumber?: number;
    /**
     * 二维码的纠错等级
     * L: 7%（错误字码在 7% 以内可被修正, 容错率较低不建议使用）
     * M: 15%（错误字码在 15% 以内可被修正, 容错率较低不建议使用）
     * Q: 25%（错误字码在 25% 以内可被修正）
     * H: 30%（错误字码在 30% 以内可被修正）
     */
    correctLevel?: "L" | "M" | "Q" | "H";
    /**
     * 二维码颜色，仅支持 六位的十六进制颜色值，暂不支持透明色 (仅对二维码生效)
     */
    codeColor?: string;
    /**
     * 二维码背景颜色，仅支持 六位的十六进制 颜色值。暂不支持透明色 (仅对二维码生效)
     */
    backgroundColor?: string;
}
export declare function generateImageBufferFromCode(options: IQrCodeImgOptions): any;
export declare function generateImageFromCode(options: IQrCodeImgOptions): any;
