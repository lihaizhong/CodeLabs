import { ResourceManager } from "../../extensions";
import { Painter } from "../painter";
export declare class Poster {
    /**
     * SVGA 元数据
     * Video Entity
     */
    private entity;
    /**
     * 当前的帧，默认值 0
     */
    private frame;
    /**
     * 填充模式，类似于 content-mode。
     */
    private contentMode;
    /**
     * 是否配置完成
     */
    private isConfigured;
    private imageData;
    /**
     * 刷头实例
     */
    readonly painter: Painter;
    resource: ResourceManager | null;
    private renderer;
    constructor(width: number, height: number);
    private register;
    /**
     * 设置配置项
     * @param options 可配置项
     */
    setConfig(options?: string | PosterConfig, component?: any): Promise<void>;
    /**
     * 修改内容模式
     * @param contentMode
     */
    setContentMode(contentMode: PLAYER_CONTENT_MODE): void;
    /**
     * 设置当前帧
     * @param frame
     */
    setFrame(frame: number): void;
    /**
     * 装载 SVGA 数据元
     * @param videoEntity SVGA 数据源
     * @param currFrame
     * @returns
     */
    mount(videoEntity: PlatformVideo.Video): Promise<void>;
    /**
     * 绘制海报
     */
    draw(): void;
    toBuffer(): Uint8Array<ArrayBufferLike>;
    /**
     * 获取海报元数据
     * @returns
     */
    toDataURL(): string;
    /**
     * 销毁海报
     */
    destroy(): void;
}
