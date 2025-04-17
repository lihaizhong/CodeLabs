import { IQrCodeImgOptions } from "../helper/qrcode-helper";
import type { Brush } from "../brush";
interface VideoEditorOptions {
    mode: "R" | "A";
}
export declare class VideoEditor {
    private readonly entity;
    private readonly brush;
    constructor(entity: Video, brush: Brush);
    private set;
    /**
     * 创建自定义编辑器
     * @param width
     * @param height
     * @returns
     */
    createEditor(width: number, height: number): IGetOffscreenCanvasResult;
    /**
     * 创建画布图片
     * @param context
     * @param options
     * @returns
     */
    setCanvas(key: string, context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D, options?: VideoEditorOptions): Promise<void>;
    /**
     * 创建二进制图片
     */
    setImage(key: string, url: string, options?: VideoEditorOptions): Promise<void>;
    /**
     * 创建二维码图片
     */
    setQRCode(key: string, code: string, options: VideoEditorOptions & Omit<IQrCodeImgOptions, "code">): Promise<void>;
}
export {};
