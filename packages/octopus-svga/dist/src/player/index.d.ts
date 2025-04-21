import { Painter } from "../painter";
/**
 * SVGA 播放器
 */
export declare class Player {
    /**
     * SVGA 元数据
     * Video Entity
     */
    private entity;
    /**
     * 当前配置项
     */
    private readonly config;
    /**
     * 动画实例
     */
    private animator;
    /**
     * 刷头实例
     */
    readonly painter: Painter;
    /**
     * 设置配置项
     * @param options 可配置项
     * @property container 主屏，播放动画的 Canvas 元素
     * @property secondary 副屏，播放动画的 Canvas 元素
     * @property loop 循环次数，默认值 0（无限循环）
     * @property fillMode 最后停留的目标模式，类似于 animation-fill-mode，接受值 forwards 和 fallbacks，默认值 forwards。
     * @property playMode 播放模式，接受值 forwards 和 fallbacks ，默认值 forwards。
     * @property startFrame 单个循环周期内开始播放的帧数，默认值 0
     * @property endFrame 单个循环周期内结束播放的帧数，默认值 0
     * @property loopStartFrame 循环播放的开始帧，仅影响第一个周期的开始帧，默认值 0
     */
    setConfig(options: string | PlayerConfigOptions, component?: WechatMiniprogram.Component.TrivialInstance | null): Promise<void>;
    /**
     * 更新配置
     * @param key
     * @param value
     */
    setItem<T extends keyof PlayerConfig>(key: T, value: PlayerConfig[T]): void;
    /**
     * 装载 SVGA 数据元
     * @param videoEntity SVGA 数据源
     * @returns Promise<void>
     */
    mount(videoEntity: Video): Promise<void[]>;
    /**
     * 开始播放事件回调
     * @param frame
     */
    onStart?: PlayerEventCallback;
    /**
     * 重新播放事件回调
     * @param frame
     */
    onResume?: PlayerEventCallback;
    /**
     * 暂停播放事件回调
     * @param frame
     */
    onPause?: PlayerEventCallback;
    /**
     * 停止播放事件回调
     * @param frame
     */
    onStop?: PlayerEventCallback;
    /**
     * 播放中事件回调
     * @param percent
     * @param frame
     * @param frames
     */
    onProcess?: PlayerProcessEventCallback;
    /**
     * 结束播放事件回调
     * @param frame
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
     * @param percent 目标百分比
     * @param andPlay 是否立即播放
     */
    stepToPercentage(percent: number, andPlay?: boolean): void;
    /**
     * 开始绘制动画
     */
    private startAnimation;
}
