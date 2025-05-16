/**
 * 二维码识别结果接口
 */
export interface QRCodeResult {
    origin: ImageData;
    data: string;
    location: {
        topLeftCorner: {
            x: number;
            y: number;
        };
        topRightCorner: {
            x: number;
            y: number;
        };
        bottomRightCorner: {
            x: number;
            y: number;
        };
        bottomLeftCorner: {
            x: number;
            y: number;
        };
    };
}
export interface PartialImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
}
/**
 * 图像分割配置
 */
export interface SplitConfig {
    gridSize: number;
    overlap: number;
}
/**
 * 多二维码扫描器类
 */
export declare class MultiQRParser {
    /**
     * 从图像数据中识别多个二维码
     * @param imageData 图像数据
     * @param config 分割配置
     * @returns 识别到的二维码结果数组
     */
    parseMultipleQRCodes(imageData: ImageData, config: SplitConfig): QRCodeResult[];
    /**
     * 将图像数据分割成多个重叠的块
     * @param imageData 原始图像数据
     * @param config 分割配置
     * @returns 分割后的图像块数组
     */
    private splitImageData;
    /**
     * 从视频帧或图像元素中识别多个二维码
     * @param elem 视频元素或图像元素
     * @param width 图像宽度
     * @param height 图像高度
     * @param config 分割配置
     * @returns 识别到的二维码结果数组
     */
    private parse;
    /**
     * 从视频帧中识别多个二维码
     * @param videoElement 视频元素
     * @param config 分割配置
     * @returns 识别到的二维码结果数组
     */
    parseFromVideoFrame(videoElement: HTMLVideoElement, config?: SplitConfig): QRCodeResult[];
    /**
     * 从图像元素中识别多个二维码
     * @param imageElement 图像元素
     * @param config 分割配置
     * @returns 识别到的二维码结果数组
     */
    parseFromImage(imageElement: HTMLImageElement, config?: SplitConfig): QRCodeResult[];
}
