import { Brush } from "../player/brush";
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
     * 刷头实例
     */
    readonly brush: Brush;
    constructor(width: number, height: number);
    /**
     * 设置配置项
     * @param options 可配置项
     */
    setConfig(options: string | PosterConfig, component?: WechatMiniprogram.Component.TrivialInstance | null): Promise<void>;
    setContentMode(contentMode: PLAYER_CONTENT_MODE): void;
    /**
     * 装载 SVGA 数据元
     * @param videoEntity SVGA 数据源
     * @param currFrame
     * @returns
     */
    mount(videoEntity: Video): Promise<void[]>;
    /**
     * 开始绘画事件回调
     */
    onStart?: PosterEventCallback;
    /**
     * 结束绘画事件回调
     */
    onEnd?: PosterEventCallback;
    /**
     * 绘制海报
     */
    draw(): void;
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
