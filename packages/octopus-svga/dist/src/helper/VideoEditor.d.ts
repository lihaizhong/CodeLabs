import { IQrCodeImgOptions } from "./qrcode";
import type { ResourceManager } from "../extensions";
import type { Painter } from "../core/painter";
interface VideoEditorOptions {
    mode?: "R" | "A";
}
export declare class VideoEditor {
    private readonly painter;
    private readonly resource;
    private readonly entity;
    constructor(painter: Painter, resource: ResourceManager, entity: PlatformVideo.Video);
    private set;
    /**
     * 获取自定义编辑器
     * @returns
     */
    getContext(): OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;
    /**
     * 是否是有效的Key
     * @param key
     * @returns
     */
    hasValidKey(key: string): boolean;
    /**
     * 加载并缓存图片
     * @param source
     * @param url
     * @returns
     */
    loadImage(source: Uint8Array | string, url: string): Promise<OctopusPlatform.PlatformImage | ImageBitmap>;
    /**
     * 创建画布图片
     * @param key
     * @param context
     * @param options
     * @returns
     */
    setCanvas(key: string, context: PlatformRenderingContext2D, options?: VideoEditorOptions & {
        width?: number;
        height?: number;
    }): Promise<void>;
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
