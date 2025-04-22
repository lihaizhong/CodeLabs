import { IQrCodeImgOptions } from "./qrcode-helper";
import type { Painter } from "../painter";
interface VideoEditorOptions {
    mode: "R" | "A";
}
export declare class VideoEditor {
    private readonly entity;
    private readonly painter;
    constructor(entity: Video, painter: Painter);
    private set;
    /**
     * 创建自定义编辑器
     * @param width
     * @param height
     * @returns
     */
    createEditor(width: number, height: number): import("octopus-platform").IGetOffscreenCanvasResult;
    /**
     * 创建画布图片
     * @param context
     * @param options
     * @returns
     */
    setCanvas(key: string, context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D, options?: VideoEditorOptions): Promise<void>;
    /**
     * 创建二进制图片
     * @param key
     * @param buff
     * @param options
     * @returns
     */
    setImage(key: string, url: string, options?: VideoEditorOptions): Promise<void>;
    /**
     * 创建二维码图片
     * @param key
     * @param code
     * @param options
     * @returns
     */
    setQRCode(key: string, code: string, options: VideoEditorOptions & Omit<IQrCodeImgOptions, "code">): Promise<void>;
}
export {};
