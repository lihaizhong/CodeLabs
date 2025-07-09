export { default as benchmark } from 'octopus-benchmark';
import { RawImage, PlatformImage, PlatformCanvas, PlatformOffscreenCanvas, Bitmap, OctopusPlatform, OctopusPlatformPlugins, OctopusPlatformPluginOptions } from 'octopus-platform';

type PlatformRenderingContext2D = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
interface RawImages {
    [key: string]: RawImage;
}
interface PlatformImages {
    [key: string]: PlatformImage | ImageBitmap;
}
interface PaintModel {
    type: "C" | "O";
    clear: "CL" | "RE" | "CR";
}
type PaintMode = "poster" | "animation";
interface CanvasSize {
    width: number;
    height: number;
}
interface TransformScale {
    scaleX: number;
    scaleY: number;
    translateX: number;
    translateY: number;
}
declare const enum PLAYER_FILL_MODE {
    /**
     * 播放完成后停在首帧
     */
    FORWARDS = "forwards",
    /**
     * 播放完成后停在尾帧
     */
    BACKWARDS = "backwards",
    /**
     * 播放完成后清空画布
     */
    NONE = "none"
}
declare const enum PLAYER_PLAY_MODE {
    /**
     * 顺序播放
     */
    FORWARDS = "forwards",
    /**
     * 倒序播放
     */
    FALLBACKS = "fallbacks"
}
declare const enum PLAYER_CONTENT_MODE {
    /**
     * 缩放图片填满 Canvas，图片可能出现变形
     */
    FILL = "fill",
    /**
     * 等比例缩放至整张图片填满 Canvas，不足部分留白
     */
    ASPECT_FIT = "aspect-fit",
    /**
     * 等比例缩放至图片填满 Canvas，超出部分不展示
     */
    ASPECT_FILL = "aspect-fill",
    /**
     * 图片对齐 Canvas 中心，超出部分不展示
     */
    CENTER = "center"
}
type PlayerEventCallback = () => void;
type PlayerProcessEventCallback = (percent: number, frame: number) => void;
type PosterEventCallback = () => void;
interface PlayerConfig {
    /**
     * 循环次数，默认值 0（无限循环）
     */
    loop: number;
    /**
     * 最后停留的目标模式，类似于 animation-fill-mode，默认值 forwards。
     */
    fillMode: PLAYER_FILL_MODE;
    /**
     * 播放模式，默认值 forwards
     */
    playMode: PLAYER_PLAY_MODE;
    /**
     * 填充模式，类似于 content-mode。
     */
    contentMode: PLAYER_CONTENT_MODE;
    /**
     * 开始播放的帧数，默认值 0
     */
    startFrame: number;
    /**
     * 结束播放的帧数，默认值 0
     */
    endFrame: number;
    /**
     * 循环播放的开始帧，默认值 0
     */
    loopStartFrame: number;
}
type PlayerConfigOptions = Partial<PlayerConfig> & {
    /**
     * 主屏，播放动画的 Canvas 元素
     */
    container: string;
    /**
     * 副屏，播放动画的 Canvas 元素
     */
    secondary?: string;
};
interface PosterConfig {
    /**
     * 主屏，绘制海报的 Canvas 元素
     */
    container?: string;
    /**
     * 填充模式，类似于 content-mode。
     */
    contentMode?: PLAYER_CONTENT_MODE;
    /**
     * 绘制成海报的帧，默认是0。
     */
    frame?: number;
}

declare namespace PlatformVideo {
    interface VideoSize {
        width: number;
        height: number;
    }
    interface Rect {
        x: number;
        y: number;
        width: number;
        height: number;
    }
    interface Transform {
        a: number;
        b: number;
        c: number;
        d: number;
        tx: number;
        ty: number;
    }
    const enum LINE_CAP_CODE {
        BUTT = 0,
        ROUND = 1,
        SQUARE = 2
    }
    const enum LINE_CAP {
        BUTT = "butt",
        ROUND = "round",
        SQUARE = "square"
    }
    const enum LINE_JOIN_CODE {
        MITER = 0,
        ROUND = 1,
        BEVEL = 2
    }
    const enum LINE_JOIN {
        MITER = "miter",
        ROUND = "round",
        BEVEL = "bevel"
    }
    type RGBA<R extends number, G extends number, B extends number, A extends number> = `rgba(${R}, ${G}, ${B}, ${A})`;
    const enum SHAPE_TYPE_CODE {
        SHAPE = 0,
        RECT = 1,
        ELLIPSE = 2,
        KEEP = 3
    }
    const enum SHAPE_TYPE {
        SHAPE = "shape",
        RECT = "rect",
        ELLIPSE = "ellipse"
    }
    interface VideoStyles {
        fill: RGBA<number, number, number, number> | null;
        stroke: RGBA<number, number, number, number> | null;
        strokeWidth: number | null;
        lineCap: CanvasLineCap | null;
        lineJoin: CanvasLineJoin | null;
        miterLimit: number | null;
        lineDash: number[] | null;
    }
    interface ShapePath {
        d: string;
    }
    interface RectPath {
        x: number;
        y: number;
        width: number;
        height: number;
        cornerRadius: number;
    }
    interface EllipsePath {
        x: number;
        y: number;
        radiusX: number;
        radiusY: number;
    }
    interface VideoShapeShape {
        type: SHAPE_TYPE.SHAPE;
        path: ShapePath;
        styles: VideoStyles;
        transform: Transform;
    }
    interface VideoShapeRect {
        type: SHAPE_TYPE.RECT;
        path: RectPath;
        styles: VideoStyles;
        transform: Transform;
    }
    interface VideoShapeEllipse {
        type: SHAPE_TYPE.ELLIPSE;
        path: EllipsePath;
        styles: VideoStyles;
        transform: Transform;
    }
    type VideoFrameShape = VideoShapeShape | VideoShapeRect | VideoShapeEllipse;
    interface HiddenVideoFrame {
        alpha: 0;
    }
    interface VideoFrame {
        alpha: number;
        transform: Transform | null;
        layout: Rect;
        shapes: VideoFrameShape[];
    }
    interface VideoSprite {
        imageKey: string;
        frames: Array<VideoFrame | HiddenVideoFrame>;
    }
    interface VideoParams {
        viewBoxWidth: number;
        viewBoxHeight: number;
        fps: number;
        frames: number;
    }
    interface Video {
        /**
         * svga 版本号
         */
        version: string;
        /**
         * svga 文件名
         */
        filename: string;
        /**
         * svga 尺寸
         */
        size: VideoSize;
        /**
         * svga 帧率
         */
        fps: number;
        /**
         * 是否可以编辑svga文件
         */
        locked: boolean;
        /**
         * svga 帧数
         */
        frames: number;
        /**
         * svga 二进制图片合集
         */
        images: RawImages;
        /**
         * svga 动态元素
         */
        dynamicElements: PlatformImages;
        /**
         * svga 关键帧信息
         */
        sprites: VideoSprite[];
    }
}

/**
 * SVGA 下载解析器
 */
declare class Parser {
    static hash(buff: ArrayBufferLike): string;
    /**
     * 解压视频源文件
     * @param data
     * @returns
     */
    static decompress(data: ArrayBufferLike): ArrayBufferLike;
    /**
     * 解析视频实体
     * @param data 视频二进制数据
     * @param url 视频地址
     * @param needDecompress 是否解压
     * @returns
     */
    static parseVideo(data: ArrayBufferLike, url: string, needDecompress?: boolean): PlatformVideo.Video;
    /**
     * 读取文件资源
     * @param url 文件资源地址
     * @returns
     */
    static download(url: string): Promise<ArrayBufferLike>;
    /**
     * 通过 url 下载并解析 SVGA 文件
     * @param url SVGA 文件的下载链接
     * @returns Promise<SVGA 数据源
     */
    static load(url: string): Promise<PlatformVideo.Video>;
}

declare class Painter {
    private readonly mode;
    /**
     * 主屏的 Canvas 元素
     * Main Screen
     */
    X: PlatformCanvas | PlatformOffscreenCanvas | null;
    /**
     * 主屏的 Context 对象
     * Main Context
     */
    XC: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    /**
     * 副屏的 Canvas 元素
     * Secondary Screen
     */
    Y: PlatformCanvas | PlatformOffscreenCanvas | null;
    /**
     * 副屏的 Context 对象
     * Secondary Context
     */
    YC: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    /**
     * 画布的宽度
     */
    W: number;
    /**
     * 画布的高度
     */
    H: number;
    /**
     * 粉刷模式
     */
    private model;
    /**
     *
     * @param mode
     *  - poster: 海报模式
     *  - animation: 动画模式
     *  - 默认为 animation
     * @param W 海报模式必须传入
     * @param H 海报模式必须传入
     */
    constructor(mode?: PaintMode, width?: number, height?: number);
    private setModel;
    /**
     * 注册画笔，根据环境判断生成最优的绘制方式
     * @param selector
     * @param ofsSelector
     * @param component
     */
    register(selector: string, ofsSelector?: string, component?: any): Promise<void>;
    clearContainer: () => void;
    clearSecondary: () => void;
    stick(): void;
    /**
     * 销毁画笔
     */
    destroy(): void;
}

declare class ResourceManager {
    private readonly painter;
    /**
     * 判断是否是 ImageBitmap
     * @param img
     * @returns
     */
    private static isBitmap;
    /**
     * 释放内存资源（图片）
     * @param img
     */
    private static releaseOne;
    private caches;
    /**
     * 动态素材
     */
    readonly dynamicMaterials: Map<string, Bitmap>;
    /**
     * 素材
     */
    readonly materials: Map<string, Bitmap>;
    /**
     * 已清理Image对象的坐标
     */
    private point;
    constructor(painter: Painter);
    /**
     * 创建图片标签
     * @returns
     */
    private createImage;
    /**
     * 将 ImageBitmap 插入到 caches
     * @param img
     */
    private inertBitmapIntoCaches;
    /**
     * 加载额外的图片资源
     * @param source 资源内容/地址
     * @param filename 文件名称
     * @returns
     */
    loadExtImage(source: string | Uint8Array, filename: string): Promise<PlatformImage | ImageBitmap>;
    /**
     * 加载图片集
     * @param images 图片数据
     * @param filename 文件名称
     * @returns
     */
    loadImagesWithRecord(images: RawImages, filename: string, type?: "normal" | "dynamic"): Promise<void>;
    /**
     * 释放图片资源
     */
    release(): void;
    /**
     * 整理图片资源，将重复的图片资源移除
     */
    private tidyUp;
    /**
     * 清理图片资源
     */
    cleanup(): void;
}

/**
 * SVGA 播放器
 */
declare class Player {
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
     * 资源管理器
     */
    resource: ResourceManager | null;
    /**
     * 刷头实例
     */
    readonly painter: Painter;
    /**
     * 动画实例
     */
    private readonly animator;
    private renderer;
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
    setConfig(options: string | PlayerConfigOptions, component?: any): Promise<void>;
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
    mount(videoEntity: PlatformVideo.Video): Promise<void>;
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

declare class Poster {
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
    /**
     * 刷头实例
     */
    readonly painter: Painter;
    /**
     * 资源管理器
     */
    resource: ResourceManager | null;
    /**
     * 渲染器实例
     */
    private renderer;
    constructor(width: number, height: number);
    /**
     * 注册 SVGA 海报
     * @param selector 容器选择器
     * @param component 组件
     */
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
    /**
     * 获取海报的 ImageData 数据
     */
    toImageData(): ImageData;
    /**
     * 销毁海报
     */
    destroy(): void;
}

type PlatformProperties = "now" | "path" | "remote" | "local" | "decode" | "image" | "rAF" | "getCanvas" | "getOfsCanvas";
declare class EnhancedPlatform extends OctopusPlatform<PlatformProperties> {
    now: OctopusPlatformPlugins["now"];
    path: OctopusPlatformPlugins["path"];
    remote: OctopusPlatformPlugins["remote"];
    local: OctopusPlatformPlugins["local"];
    decode: OctopusPlatformPlugins["decode"];
    image: OctopusPlatformPlugins["image"];
    rAF: OctopusPlatformPlugins["rAF"];
    getCanvas: OctopusPlatformPlugins["getCanvas"];
    getOfsCanvas: OctopusPlatformPlugins["getOfsCanvas"];
    constructor();
    installPlugin(plugin: OctopusPlatformPluginOptions<PlatformProperties>): void;
}
declare const platform: EnhancedPlatform;

interface IQrCodeImgOptions {
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
declare function generateImageBufferFromCode(options: IQrCodeImgOptions): any;
declare function generateImageFromCode(options: IQrCodeImgOptions): string;

declare function getBufferFromImageData(imageData: ImageData): Uint8Array<ArrayBufferLike>;
declare function getDataURLFromImageData(imageData: ImageData): string;

interface Bucket {
    origin: string;
    local: string;
    entity: PlatformVideo.Video | null;
    promise: Promise<ArrayBuffer> | null;
}
interface NeedUpdatePoint {
    action: "remove" | "add";
    start: number;
    end: number;
}
type LoadMode = "fast" | "whole";
interface VideoManagerOptions {
    preprocess: (bucket: Bucket) => Promise<ArrayBuffer>;
    postprocess: (bucket: Bucket, buff: ArrayBuffer) => Promise<PlatformVideo.Video> | PlatformVideo.Video;
}
declare class VideoManager {
    /**
     * 将文件写入用户目录中
     * @param bucket
     * @param buff
     */
    private static writeFileToUserDirectory;
    /**
     * 从用户目录中移除文件
     * @param bucket
     * @returns
     */
    private static removeFileFromUserDirectory;
    /**
     * 视频池的当前指针位置
     */
    private point;
    /**
     * 视频的最大留存数量，其他视频将放在磁盘上缓存
     */
    private maxRemain;
    /**
     * 留存视频的开始指针位置
     */
    private remainStart;
    /**
     * 留存视频的结束指针位置
     */
    private remainEnd;
    /**
     * 视频加载模式
     * - 快速加载模式：可保证当前视频加载完成后，尽快播放；其他请求将使用Promise的方式保存在bucket中，以供后续使用
     * - 完整加载模式：可保证所有视频加载完成，确保播放切换的流畅性
     */
    private loadMode;
    /**
     * 视频池的所有数据
     */
    private buckets;
    private readonly options;
    /**
     * 获取视频池大小
     */
    get size(): number;
    constructor(loadMode: LoadMode, options?: Partial<VideoManagerOptions>);
    /**
     * 更新留存指针位置
     */
    private updateRemainRange;
    /**
     * 指针是否在留存空间内
     * @param point
     * @returns
     */
    private includeRemainRange;
    private downloadAndParseVideo;
    /**
     * 创建bucket
     * @param url 远程地址
     * @param point 指针位置
     * @param needDownloadAndParse 是否需要下载并解析
     * @returns
     */
    private createBucket;
    /**
     * 预加载视频到本地磁盘中
     * @param urls 视频远程地址
     * @param point 当前指针位置
     * @param maxRemain 最大留存数量
     */
    prepare(urls: string[], point?: number, maxRemain?: number): Promise<void>;
    /**
     * 获取当前帧的bucket
     * @returns
     */
    get(): Promise<Bucket>;
    /**
     * 获取当前的指针位置
     * @returns
     */
    getPoint(): number;
    /**
     * 获取指定位置的bucket
     * @param pos
     * @returns
     */
    go(point: number): Promise<Bucket>;
    /**
     * 清理所有的bucket
     * @returns
     */
    clear(needRemoveFiles?: boolean): Promise<void>;
}

interface VideoEditorOptions {
    mode?: "R" | "A";
}
declare class VideoEditor {
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
    loadImage(source: Uint8Array | string, url: string): Promise<PlatformImage | ImageBitmap>;
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

export { PLAYER_CONTENT_MODE, PLAYER_FILL_MODE, PLAYER_PLAY_MODE, Painter, Parser, PlatformVideo, Player, Poster, VideoEditor, VideoManager, generateImageBufferFromCode, generateImageFromCode, getBufferFromImageData, getDataURLFromImageData, platform };
export type { Bucket, CanvasSize, IQrCodeImgOptions, LoadMode, NeedUpdatePoint, PaintMode, PaintModel, PlatformImages, PlatformRenderingContext2D, PlayerConfig, PlayerConfigOptions, PlayerEventCallback, PlayerProcessEventCallback, PosterConfig, PosterEventCallback, RawImages, TransformScale, VideoManagerOptions };
