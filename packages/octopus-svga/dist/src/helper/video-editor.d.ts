import { IQrCodeImgOptions } from "./qrcode-helper";
interface VideoEditorOptions {
    mode?: "R" | "A";
    container?: string;
    component?: any;
}
export declare class VideoEditor {
    private readonly entity;
    private readonly options;
    constructor(entity: PlatformVideo.Video, options?: Omit<VideoEditorOptions, "mode">);
    private set;
    /**
     * 创建自定义编辑器
     * @param width
     * @param height
     * @returns
     */
    createContext(width: number, height: number): Promise<OctopusPlatform.GetOffscreenCanvasResult | OctopusPlatform.GetCanvasResult>;
    /**
     * 创建画布图片
     * @param context
     * @param options
     * @returns
     */
    setCanvas(key: string, context: PlatformRenderingContext2D, options?: VideoEditorOptions): Promise<void>;
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
