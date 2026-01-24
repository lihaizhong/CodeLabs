import * as octopus_svga_engine from 'octopus-svga-engine';
import { Bitmap, ResourceManager, Painter, PlayerConfigOptions, PlayerConfig, PlatformVideo, PlayerEventCallback, PlayerProcessEventCallback } from 'octopus-svga-engine';
export { PLAYER_CONTENT_MODE, PLAYER_FILL_MODE, PLAYER_PLAY_MODE, Painter, Parser, PlatformVideo, PlayerConfig, PlayerConfigOptions, PlayerEventCallback, PlayerProcessEventCallback, platform } from 'octopus-svga-engine';

/**
 * 动态元素管理器
 * 提供图片替换、文本添加、二维码生成等功能
 */
declare class DynamicElementManager {
    private readonly painter;
    /**
     * 动态素材映射
     */
    private readonly dynamicMaterials;
    constructor(painter: octopus_svga_engine.Painter);
    /**
     * 替换指定 key 的图片
     * @param key 动态元素的 key
     * @param source 图片源（URL 或 Uint8Array）
     * @returns Promise<Bitmap>
     */
    setImage(key: string, source: string | Uint8Array): Promise<Bitmap>;
    /**
     * 添加动态文本
     * @param key 动态元素的 key
     * @param text 文本内容
     * @param options 文本选项
     * @returns Promise<Bitmap>
     */
    setText(key: string, text: string, options?: TextOptions): Promise<Bitmap>;
    /**
     * 添加二维码
     * @param key 动态元素的 key
     * @param content 二维码内容
     * @param options 二维码选项
     * @returns Promise<Bitmap>
     */
    setQRCode(key: string, content: string, options?: QRCodeOptions): Promise<Bitmap>;
    /**
     * 添加自定义画布内容
     * @param key 动态元素的 key
     * @param context 画布上下文
     * @param options 画布选项
     * @returns Promise<Bitmap>
     */
    setCanvas(key: string, context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, options?: CanvasOptions): Promise<Bitmap>;
    /**
     * 获取动态素材
     * @param key 动态元素的 key
     * @returns Bitmap | undefined
     */
    get(key: string): Bitmap | undefined;
    /**
     * 获取所有动态素材
     * @returns Map<string, Bitmap>
     */
    getAll(): Map<string, Bitmap>;
    /**
     * 移除动态素材
     * @param key 动态元素的 key
     */
    remove(key: string): void;
    /**
     * 清空所有动态素材
     */
    clear(): void;
}
/**
 * 文本选项
 */
interface TextOptions {
    /**
     * 画布宽度
     */
    width?: number;
    /**
     * 画布高度
     */
    height?: number;
    /**
     * 字体大小
     */
    fontSize?: number;
    /**
     * 字体家族
     */
    fontFamily?: string;
    /**
     * 文本颜色
     */
    color?: string;
    /**
     * 背景颜色
     */
    backgroundColor?: string;
    /**
     * 文本对齐方式
     */
    textAlign?: CanvasTextAlign;
    /**
     * 文本基线
     */
    textBaseline?: CanvasTextBaseline;
}
/**
 * 二维码选项
 */
interface QRCodeOptions {
    /**
     * 二维码尺寸
     */
    size?: number;
    /**
     * 二维码颜色
     */
    color?: string;
    /**
     * 背景颜色
     */
    backgroundColor?: string;
}
/**
 * 画布选项
 */
interface CanvasOptions {
    /**
     * 画布宽度
     */
    width?: number;
    /**
     * 画布高度
     */
    height?: number;
    /**
     * 模式
     */
    mode?: "A" | "B";
}

/**
 * SVGA 播放器
 */
declare class Player {
    /**
     * SVGA 元数据
     */
    private entity;
    /**
     * 当前配置项
     */
    private config;
    /**
     * 资源管理器
     */
    resource: ResourceManager | null;
    /**
     * 画布渲染器
     */
    readonly painter: Painter;
    /**
     * 动画控制器
     */
    private readonly animator;
    /**
       * 动态元素管理器
       */
    private dynamicElementManager;
    /**
     * 设置配置项
     * @param options 可配置项
     * @param component 组件对象（小程序中使用）
     */
    setConfig(options: string | PlayerConfigOptions, component?: any): Promise<void>;
    /**
     * 更新配置项
     * @param key 配置项键
     * @param value 配置项值
     */
    setItem<T extends keyof PlayerConfig>(key: T, value: PlayerConfig[T]): void;
    /**
     * 装载 SVGA 数据
     * @param videoEntity SVGA 数据源
     * @returns Promise<void>
     */
    mount(videoEntity: PlatformVideo.Video): Promise<void>;
    /**
     * 开始播放事件回调
     */
    onStart?: PlayerEventCallback;
    /**
     * 重新播放事件回调
     */
    onResume?: PlayerEventCallback;
    /**
     * 暂停播放事件回调
     */
    onPause?: PlayerEventCallback;
    /**
     * 停止播放事件回调
     */
    onStop?: PlayerEventCallback;
    /**
     * 播放中事件回调
     * @param percent 播放进度 (0-1)
     * @param frame 当前帧数
     */
    onProcess?: PlayerProcessEventCallback;
    /**
     * 结束播放事件回调
     */
    onEnd?: PlayerEventCallback;
    /**
     * 开始播放
     */
    start(): void;
    /**
     * 重新播放
     */
    resume(): void;
    /**
     * 暂停播放
     */
    pause(): void;
    /**
     * 停止播放
     */
    stop(): void;
    /**
     * 销毁实例
     */
    destroy(): void;
    /**
     * 跳转到指定帧
     * @param frame 目标帧
     * @param andPlay 是否立即播放
     */
    stepToFrame(frame: number, andPlay?: boolean): void;
    /**
     * 跳转到指定百分比
     * @param percent 目标百分比 (0-1)
     * @param andPlay 是否立即播放
     */
    stepToPercentage(percent: number, andPlay?: boolean): void;
    /**
     * 替换指定 key 的图片
     * @param key 动态元素的 key
     * @param source 图片源（URL 或 Uint8Array）
     * @returns Promise<Bitmap>
     */
    setImage(key: string, source: string | Uint8Array): Promise<octopus_svga_engine.Bitmap>;
    /**
     * 添加动态文本
     * @param key 动态元素的 key
     * @param text 文本内容
     * @param options 文本选项
     * @returns Promise<Bitmap>
     */
    setText(key: string, text: string, options?: TextOptions): Promise<octopus_svga_engine.Bitmap>;
    /**
     * 添加二维码
     * @param key 动态元素的 key
     * @param content 二维码内容
     * @param options 二维码选项
     * @returns Promise<Bitmap>
     */
    setQRCode(key: string, content: string, options?: QRCodeOptions): Promise<octopus_svga_engine.Bitmap>;
    /**
     * 添加自定义画布内容
     * @param key 动态元素的 key
     * @param context 画布上下文
     * @param options 画布选项
     * @returns Promise<Bitmap>
     */
    setCanvas(key: string, context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, options?: CanvasOptions): Promise<octopus_svga_engine.Bitmap>;
    /**
     * 移除动态素材
     * @param key 动态元素的 key
     */
    removeDynamicElement(key: string): void;
    /**
     * 清空所有动态素材
     */
    clearDynamicElements(): void;
    /**
     * 开始绘制动画
     */
    private startAnimation;
}

export { DynamicElementManager, Player };
export type { CanvasOptions, QRCodeOptions, TextOptions };
