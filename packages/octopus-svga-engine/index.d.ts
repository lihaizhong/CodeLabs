import { PlatformVideo as PlatformVideo$1, PainterMode as PainterMode$1, PLAYER_CONTENT_MODE as PLAYER_CONTENT_MODE$1, RawImages as RawImages$1, PlatformRenderingContext2D as PlatformRenderingContext2D$1, CanvasSize as CanvasSize$1 } from '@/types';
import * as octopus_platform from 'octopus-platform';
import { PlatformCanvas, PlatformOffscreenCanvas, Bitmap, PlatformImage, RawImage } from 'octopus-platform';
export { Bitmap, PlatformCanvas, PlatformImage, PlatformOffscreenCanvas, RawImage } from 'octopus-platform';
import { Painter as Painter$1 } from '@/painter';

/**
 * SVGA 下载解析器
 */
declare class Parser {
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
    static parseVideo(data: ArrayBufferLike, url: string, needDecompress?: boolean): PlatformVideo$1.Video;
    /**
     * 读取文件资源
     * @param url 文件资源地址
     * @returns
     */
    static download(url: string): Promise<ArrayBuffer>;
    /**
     * 通过 url 下载并解析 SVGA 文件
     * @param url SVGA 文件的下载链接
     * @returns Promise<SVGA 数据源
     */
    static load(url: string): Promise<PlatformVideo$1.Video>;
}

declare class Painter {
    private readonly mode;
    /**
     * 主屏的 Canvas 元素
     * Front Screen
     */
    F: PlatformCanvas | PlatformOffscreenCanvas | null;
    /**
     * 主屏的 Context 对象
     * Front Context
     */
    FC: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    /**
     * 副屏的 Canvas 元素
     * Background Screen
     */
    B: PlatformCanvas | PlatformOffscreenCanvas | null;
    /**
     * 副屏的 Context 对象
     * Background Context
     */
    BC: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
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
     * 渲染器实例
     */
    private renderer;
    /**
     *
     * @param mode
     * @param W 海报模式必须传入
     * @param H 海报模式必须传入
     */
    constructor(mode?: PainterMode$1, width?: number, height?: number);
    /**
     * 设置 Canvas 的处理模式
     * - C：代表 Canvas
     * - O：代表 OffscreenCanvas
     */
    private setActionModel;
    /**
     * 注册画笔，根据环境判断生成最优的绘制方式
     * @param selector
     * @param ofsSelector
     * @param component
     */
    register(selector: string, ofsSelector?: string, component?: any): Promise<void>;
    clearContainer: () => void;
    clearSecondary: () => void;
    resize: (contentMode: PLAYER_CONTENT_MODE$1, videoSize: PlatformVideo$1.VideoSize) => void;
    draw: (videoEntity: PlatformVideo$1.Video, materials: Map<string, Bitmap>, dynamicMaterials: Map<string, Bitmap>, currentFrame: number, head: number, tail: number) => void;
    stick: () => void;
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
    constructor(painter: Painter$1);
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
    loadImagesWithRecord(images: RawImages$1, filename: string, type?: "normal" | "dynamic"): Promise<void>;
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

declare class Preflight {
    private caches;
    private count;
    get size(): number;
    get hitCount(): number;
    /**
     * 计算二进制数据的哈希值
     * @param reader Reader对象
     * @param end 结束位置
     * @returns 哈希值
     */
    calculate(reader: Reader, end: number): string;
    /**
     * 检查是否存在缓存数据
     * @param key 键
     * @returns 是否存在
     */
    has(key: string): boolean;
    /**
     * 获取缓存数据
     * @param key 键
     * @returns 缓存数据
     */
    get(key: string): any;
    /**
     * 设置缓存数据
     * @param key 键
     * @param value 缓存数据
     */
    set(key: string, value: any): void;
    /**
     * 清空所有缓存数据
     */
    clear(): void;
}

declare class Reader {
    private static EMPTY_UINT8ARRAY;
    /**
     * Read buffer.
     * @type {Uint8Array}
     */
    readonly buf: Uint8Array;
    /**
     * Read buffer length.
     * @type {number}
     */
    readonly len: number;
    /**
     * Read buffer position.
     * @type {number}
     */
    pos: number;
    preflight: Preflight;
    /**
     * Constructs a new reader instance using the specified buffer.
     * @classdesc Wire format reader using `Uint8Array` if available, otherwise `Array`.
     * @constructor
     * @param {Uint8Array} buffer Buffer to read from
     */
    constructor(buffer: Uint8Array);
    private indexOutOfRange;
    /**
     * 将复杂逻辑分离到单独方法
     * @returns
     */
    private readVarint32Slow;
    /**
     * Reads a sequence of bytes preceded by its length as a varint.
     * @param length
     * @returns
     */
    end(length?: number): number;
    /**
     * Reads a varint as an unsigned 32 bit value.
     * @function
     * @returns {number} Value read
     */
    uint32(): number;
    /**
     * Reads a varint as a signed 32 bit value.
     * @returns {number} Value read
     */
    int32(): number;
    /**
     * Reads a float (32 bit) as a number.
     * @function
     * @returns {number} Value read
     */
    float(): number;
    /**
     * read bytes range
     * @returns
     */
    private getBytesRange;
    /**
     * Reads a sequence of bytes preceded by its length as a varint.
     * @returns {Uint8Array} Value read
     */
    bytes(): Uint8Array<ArrayBufferLike>;
    /**
     * Reads a string preceeded by its byte length as a varint.
     * @returns {string} Value read
     */
    string(): string;
    /**
     * Skips the specified number of bytes if specified, otherwise skips a varint.
     * @param {number} [length] Length if known, otherwise a varint is assumed
     * @returns {Reader} `this`
     */
    skip(length?: number): this;
    /**
     * Skips the next element of the specified wire type.
     * @param {number} wireType Wire type received
     * @returns {Reader} `this`
     */
    skipType(wireType: number): this;
}

declare class MovieParams {
    /**
     * Decodes a MovieParams message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.MovieParams
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.MovieParams} MovieParams
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader, length?: number): PlatformVideo$1.VideoParams;
    /**
     * MovieParams viewBoxWidth.
     * @member {number} viewBoxWidth
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    viewBoxWidth: number;
    /**
     * MovieParams viewBoxHeight.
     * @member {number} viewBoxHeight
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    viewBoxHeight: number;
    /**
     * MovieParams fps.
     * @member {number} fps
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    fps: number;
    /**
     * MovieParams frames.
     * @member {number} frames
     * @memberof com.opensource.svga.MovieParams
     * @instance
     */
    frames: number;
}

declare class MovieEntity {
    static EMPTY_U8: Uint8Array<ArrayBuffer>;
    /**
     * Decodes a MovieEntity message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.MovieEntity
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.MovieEntity} MovieEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader, length?: number): PlatformVideo$1.Video;
    static format(message: MovieEntity): PlatformVideo$1.Video;
    /**
     * MovieEntity version.
     * @member {string} version
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     */
    version: string;
    /**
     * MovieEntity params.
     * @member {com.opensource.svga.IMovieParams|null|undefined} params
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     */
    params: MovieParams | null;
    /**
     * MovieEntity images.
     * @member {Object.<string,Uint8Array>} images
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     */
    images: Record<string, Uint8Array>;
    /**
     * MovieEntity sprites.
     * @member {Array.<com.opensource.svga.ISpriteEntity>} sprites
     * @memberof com.opensource.svga.MovieEntity
     * @instance
     */
    sprites: PlatformVideo$1.VideoSprite[];
}

declare class EllipseArgs {
    /**
     * Decodes an EllipseArgs message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.EllipseArgs} EllipseArgs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader, length?: number): PlatformVideo$1.EllipsePath;
    /**
     * EllipseArgs x.
     * @member {number} x
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    x: number;
    /**
     * EllipseArgs y.
     * @member {number} y
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    y: number;
    /**
     * EllipseArgs radiusX.
     * @member {number} radiusX
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    radiusX: number;
    /**
     * EllipseArgs radiusY.
     * @member {number} radiusY
     * @memberof com.opensource.svga.ShapeEntity.EllipseArgs
     * @instance
     */
    radiusY: number;
}

declare class FrameEntity {
    private static HIDDEN_FRAME;
    /**
     * Decodes a FrameEntity message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.FrameEntity
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.FrameEntity} FrameEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader, length?: number): PlatformVideo$1.VideoFrame | PlatformVideo$1.HiddenVideoFrame;
    private static format;
    /**
     * FrameEntity shapes.
     * @member {Array.<com.opensource.svga.IShapeEntity>} shapes
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    shapes: PlatformVideo$1.VideoFrameShape[];
    /**
     * FrameEntity alpha.
     * @member {number} alpha
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    alpha: number;
    /**
     * FrameEntity layout.
     * @member {com.opensource.svga.ILayout|null|undefined} layout
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    layout: PlatformVideo$1.Rect | null;
    /**
     * FrameEntity transform.
     * @member {com.opensource.svga.ITransform|null|undefined} transform
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    transform: PlatformVideo$1.Transform | null;
    /**
     * FrameEntity clipPath.
     * @member {string} clipPath
     * @memberof com.opensource.svga.FrameEntity
     * @instance
     */
    clipPath: string;
}

declare class Layout {
    /**
     * Decodes a Layout message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.Layout
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.Layout} Layout
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader, length?: number): PlatformVideo$1.Rect;
    static format(message: Layout): PlatformVideo$1.Rect;
    /**
     * Layout x.
     * @member {number} x
     * @memberof com.opensource.svga.Layout
     * @instance
     */
    x: number;
    /**
     * Layout y.
     * @member {number} y
     * @memberof com.opensource.svga.Layout
     * @instance
     */
    y: number;
    /**
     * Layout width.
     * @member {number} width
     * @memberof com.opensource.svga.Layout
     * @instance
     */
    width: number;
    /**
     * Layout height.
     * @member {number} height
     * @memberof com.opensource.svga.Layout
     * @instance
     */
    height: number;
}

declare class RectArgs {
    /**
     * Decodes a RectArgs message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.RectArgs} RectArgs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader, length?: number): PlatformVideo$1.RectPath;
    /**
     * RectArgs x.
     * @member {number} x
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    x: number;
    /**
     * RectArgs y.
     * @member {number} y
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    y: number;
    /**
     * RectArgs width.
     * @member {number} width
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    width: number;
    /**
     * RectArgs height.
     * @member {number} height
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    height: number;
    /**
     * RectArgs cornerRadius.
     * @member {number} cornerRadius
     * @memberof com.opensource.svga.ShapeEntity.RectArgs
     * @instance
     */
    cornerRadius: number;
}

declare class RGBAColor {
    /**
     * Decodes a RGBAColor message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor} RGBAColor
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader, length?: number): PlatformVideo$1.RGBA<number, number, number, number>;
    static format(message: RGBAColor): PlatformVideo$1.RGBA<number, number, number, number>;
    /**
     * RGBAColor r.
     * @member {number} r
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    r: number;
    /**
     * RGBAColor g.
     * @member {number} g
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    g: number;
    /**
     * RGBAColor b.
     * @member {number} b
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    b: number;
    /**
     * RGBAColor a.
     * @member {number} a
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle.RGBAColor
     * @instance
     */
    a: number;
}

declare class ShapeArgs {
    /**
     * Decodes a ShapeArgs message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.ShapeArgs} ShapeArgs
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader, length?: number): PlatformVideo$1.ShapePath;
    /**
     * ShapeArgs d.
     * @member {string} d
     * @memberof com.opensource.svga.ShapeEntity.ShapeArgs
     * @instance
     */
    d: string;
}

declare class ShapeEntity {
    /**
     * Decodes a ShapeEntity message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity} ShapeEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader, length?: number): PlatformVideo$1.VideoFrameShape | null;
    static format(message: ShapeEntity): PlatformVideo$1.VideoFrameShape | null;
    /**
     * ShapeEntity type.
     * @member {com.opensource.svga.ShapeEntity.ShapeType} type
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    type: PlatformVideo$1.SHAPE_TYPE_CODE;
    /**
     * ShapeEntity shape.
     * @member {com.opensource.svga.ShapeEntity.IShapeArgs|null|undefined} shape
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    shape: PlatformVideo$1.ShapePath | null;
    /**
     * ShapeEntity rect.
     * @member {com.opensource.svga.ShapeEntity.IRectArgs|null|undefined} rect
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    rect: PlatformVideo$1.RectPath | null;
    /**
     * ShapeEntity ellipse.
     * @member {com.opensource.svga.ShapeEntity.IEllipseArgs|null|undefined} ellipse
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    ellipse: PlatformVideo$1.EllipsePath | null;
    /**
     * ShapeEntity styles.
     * @member {com.opensource.svga.ShapeEntity.IShapeStyle|null|undefined} styles
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    styles: PlatformVideo$1.VideoStyles | null;
    /**
     * ShapeEntity transform.
     * @member {com.opensource.svga.ITransform|null|undefined} transform
     * @memberof com.opensource.svga.ShapeEntity
     * @instance
     */
    transform: PlatformVideo$1.Transform | null;
}

declare class ShapeStyle {
    /**
     * Decodes a ShapeStyle message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.ShapeEntity.ShapeStyle} ShapeStyle
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader, length?: number): PlatformVideo$1.VideoStyles;
    static format(message: ShapeStyle): PlatformVideo$1.VideoStyles;
    /**
     * ShapeStyle fill.
     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null|undefined} fill
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    fill: PlatformVideo$1.RGBA<number, number, number, number> | null;
    /**
     * ShapeStyle stroke.
     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.IRGBAColor|null|undefined} stroke
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    stroke: PlatformVideo$1.RGBA<number, number, number, number> | null;
    /**
     * ShapeStyle strokeWidth.
     * @member {number} strokeWidth
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    strokeWidth: number;
    /**
     * ShapeStyle lineCap.
     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.LineCap} lineCap
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineCap: PlatformVideo$1.LINE_CAP_CODE;
    /**
     * ShapeStyle lineJoin.
     * @member {com.opensource.svga.ShapeEntity.ShapeStyle.LineJoin} lineJoin
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineJoin: PlatformVideo$1.LINE_JOIN_CODE;
    /**
     * ShapeStyle miterLimit.
     * @member {number} miterLimit
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    miterLimit: number;
    /**
     * ShapeStyle lineDashI.
     * @member {number} lineDashI
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineDashI: number;
    /**
     * ShapeStyle lineDashII.
     * @member {number} lineDashII
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineDashII: number;
    /**
     * ShapeStyle lineDashIII.
     * @member {number} lineDashIII
     * @memberof com.opensource.svga.ShapeEntity.ShapeStyle
     * @instance
     */
    lineDashIII: number;
}

declare class SpriteEntity {
    /**
     * Decodes a SpriteEntity message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.SpriteEntity
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.SpriteEntity} SpriteEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader, length?: number): PlatformVideo$1.VideoSprite;
    static format(message: SpriteEntity): PlatformVideo$1.VideoSprite;
    /**
     * SpriteEntity frames.
     * @member {Array.<com.opensource.svga.IFrameEntity>} frames
     * @memberof com.opensource.svga.SpriteEntity
     * @instance
     */
    frames: Array<PlatformVideo$1.VideoFrame | PlatformVideo$1.HiddenVideoFrame>;
    /**
     * SpriteEntity imageKey.
     * @member {string} imageKey
     * @memberof com.opensource.svga.SpriteEntity
     * @instance
     */
    imageKey: string;
    /**
     * SpriteEntity matteKey.
     * @member {string} matteKey
     * @memberof com.opensource.svga.SpriteEntity
     * @instance
     */
    matteKey: string;
}

declare class Transform {
    /**
     * Decodes a Transform message from the specified reader.
     * @function decode
     * @memberof com.opensource.svga.Transform
     * @static
     * @param {$protobuf.Reader} reader Reader to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {com.opensource.svga.Transform} Transform
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(reader: Reader, length?: number): PlatformVideo$1.Transform;
    /**
     * Transform a.
     * @member {number} a
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    a: number;
    /**
     * Transform b.
     * @member {number} b
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    b: number;
    /**
     * Transform c.
     * @member {number} c
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    c: number;
    /**
     * Transform d.
     * @member {number} d
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    d: number;
    /**
     * Transform tx.
     * @member {number} tx
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    tx: number;
    /**
     * Transform ty.
     * @member {number} ty
     * @memberof com.opensource.svga.Transform
     * @instance
     */
    ty: number;
}

declare function createVideoEntity(data: Uint8Array, filename: string): PlatformVideo.Video;

declare class Renderer2D {
    private context;
    /**
     * https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths
     * 绘制路径的不同指令：
     * * 直线命令
     * - M: moveTo，移动到指定点，不绘制直线。
     * - L: lineTo，从起始点绘制一条直线到指定点。
     * - H: horizontal lineTo，从起始点绘制一条水平线到指定点。
     * - V: vertical lineTo，从起始点绘制一条垂直线到指定点。
     * - Z: closePath，从起始点绘制一条直线到路径起点，形成一个闭合路径。
     * * 曲线命令
     * - C: bezierCurveTo，绘制三次贝塞尔曲线。
     * - S: smooth curveTo，绘制平滑三次贝塞尔曲线。
     * - Q: quadraticCurveTo，绘制两次贝塞尔曲线。
     * - T: smooth quadraticCurveTo，绘制平滑两次贝塞尔曲线。
     * * 弧线命令
     * - A: arcTo，从起始点绘制一条弧线到指定点。
     */
    private static SVG_PATH;
    private static SVG_LETTER_REGEXP;
    private static parseSVGPath;
    private static fillOrStroke;
    private static resetShapeStyles;
    /**
     * 计算缩放比例
     * @param contentMode
     * @param videoSize
     * @param canvasSize
     * @returns
     */
    private static calculateScale;
    private readonly pointPool;
    private currentPoint;
    private lastResizeKey;
    private globalTransform?;
    constructor(context: PlatformRenderingContext2D$1 | null);
    private setTransform;
    private drawBezier;
    private drawBezierElement;
    private drawEllipse;
    private drawRect;
    private drawShape;
    private drawSprite;
    /**
     * 调整画布尺寸
     * @param contentMode
     * @param videoSize
     * @param canvasSize
     * @returns
     */
    resize(contentMode: PLAYER_CONTENT_MODE$1, videoSize: PlatformVideo$1.VideoSize, canvasSize: CanvasSize$1): void;
    render(videoEntity: PlatformVideo$1.Video, materials: Map<string, Bitmap>, dynamicMaterials: Map<string, Bitmap>, currentFrame: number, head: number, tail: number): void;
    destroy(): void;
}

interface Renderer2DOptions {
    context: PlatformRenderingContext2D$1;
}
interface Renderer2DExtensions {
    stick: (context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, bitmap: Bitmap) => () => void;
    clear: (type: "CL" | "RE", context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, canvas: PlatformCanvas | PlatformOffscreenCanvas, width: number, height: number) => () => void;
}
interface Renderer2DReturn {
    renderer: Renderer2D;
    extensions: Renderer2DExtensions;
}
declare const create2DRenderer: ({ context }: Renderer2DOptions) => Renderer2DReturn;
declare const detect2DSupport: () => boolean;

declare class RendererGL {
    private glContext;
    private gl;
    private shaderProgram;
    private positionBuffer;
    private texCoordBuffer;
    private vertexBuffer;
    private colorBuffer;
    private textureCache;
    private globalTransform?;
    private lastResizeKey;
    constructor(glContext: WebGLRenderingContext | null);
    private initialize;
    private setupShaders;
    private createShader;
    private createProgram;
    private setupBuffers;
    private setupAttributes;
    private createTextureFromBitmap;
    private createMatrix;
    private static calculateScale;
    private drawRectangle;
    private drawEllipse;
    private drawShape;
    private drawSprite;
    resize(contentMode: PLAYER_CONTENT_MODE$1, videoSize: PlatformVideo$1.VideoSize, canvasSize: {
        width: number;
        height: number;
    }): void;
    render(videoEntity: PlatformVideo$1.Video, materials: Map<string, Bitmap>, dynamicMaterials: Map<string, Bitmap>, currentFrame: number, head: number, tail: number): void;
    destroy(): void;
}

interface GLRendererOptions {
    glContext: WebGLRenderingContext;
}
declare const createGLRenderer: ({ glContext }: GLRendererOptions) => RendererGL;
declare const detectGLSupport: () => {
    webgl: boolean;
    webgl2: boolean;
    maxTextureSize: number;
    maxVertexAttribs: number;
};
interface GLShader {
    program: WebGLProgram;
    vertexShader: WebGLShader;
    fragmentShader: WebGLShader;
}
declare const RendererGLExtension: {
    stick: (gl: WebGLRenderingContext, bitmap: Bitmap) => () => void;
    clear: (type: "CL" | "RE", gl: WebGLRenderingContext, canvas: PlatformCanvas | PlatformOffscreenCanvas, width: number, height: number) => () => void;
};

declare class RendererGPU {
    private gpuDevice;
    private device;
    private context;
    private canvas;
    private pipeline;
    private vertexBuffer;
    private uniformBuffer;
    private textureCache;
    private sampler;
    private globalTransform?;
    private lastResizeKey;
    constructor(gpuDevice: any, canvas?: HTMLCanvasElement);
    private initialize;
    private setupPipeline;
    private setupBuffers;
    private setupSampler;
    private createTextureFromBitmap;
    private createMatrix;
    private static calculateScale;
    private drawRectangle;
    private drawEllipse;
    private drawShape;
    private drawSprite;
    resize(contentMode: PLAYER_CONTENT_MODE$1, videoSize: PlatformVideo$1.VideoSize, canvasSize: {
        width: number;
        height: number;
    }): void;
    render(videoEntity: PlatformVideo$1.Video, materials: Map<string, Bitmap>, dynamicMaterials: Map<string, Bitmap>, currentFrame: number, head: number, tail: number): void;
    destroy(): void;
}

type GPUDevice = any;
type GPUShaderModule = any;
type GPURenderPipeline = any;
type GPUCanvasContext = any;
declare global {
    interface Navigator {
        gpu?: {
            requestAdapter(): Promise<any>;
            getPreferredCanvasFormat(): string;
        };
    }
}
interface GPURendererOptions {
    gpuDevice: GPUDevice;
    canvas?: HTMLCanvasElement;
}
declare const createGPURenderer: ({ gpuDevice, canvas }: GPURendererOptions) => Promise<RendererGPU | null>;
declare const detectGPUSupport: () => Promise<{
    webgpu: boolean;
    adapterInfo: {
        description: string;
        vendor: string;
        architecture: string;
        device: string;
        featureName: string;
    } | null;
}>;
interface GPUShader {
    module: GPUShaderModule;
    pipeline: GPURenderPipeline;
}
declare const RendererGPUExtension: {
    stick: (device: GPUDevice, bitmap: Bitmap) => Promise<any>;
    clear: (type: "CL" | "RE", device: GPUDevice, context: GPUCanvasContext, canvas: PlatformCanvas | PlatformOffscreenCanvas, width: number, height: number) => () => void;
};

type RendererType = '2d' | 'webgl' | 'webgl2' | 'webgpu';
interface RendererInfo {
    type: RendererType;
    name: string;
    supported: boolean;
    priority: number;
}
declare const detectRendererSupport: () => Promise<RendererInfo[]>;
declare function createRenderer(type: "2d", canvas?: PlatformCanvas, context?: PlatformRenderingContext2D$1): Promise<Renderer2D | null>;
declare function createRenderer(type: "webgl" | "webgl2", canvas?: PlatformCanvas, glContext?: WebGLRenderingContext): Promise<RendererGL | null>;
declare function createRenderer(type: "webgpu", canvas?: PlatformCanvas, gpuDevice?: any): Promise<RendererGPU | null>;
declare const createBestRenderer: (canvas?: PlatformCanvas, context?: any) => Promise<{
    type: RendererType;
    renderer: Renderer2D | RendererGL | RendererGPU | null;
} | null>;

/**
 * 动画控制器
 */
declare class Animator {
    /**
     * 动画是否执行
     */
    private isRunning;
    /**
     * 动画开始时间
     */
    private startTime;
    /**
     * 动画持续时间
     */
    private duration;
    /**
     * 循环播放开始帧与动画开始帧之间的时间偏差
     */
    private loopStart;
    /**
     * 动画暂停时的时间偏差
     */
    private pauseTime;
    /**
     * 循环持续时间
     */
    private loopDuration;
    onAnimate: (callback: () => void) => number;
    onStart: () => void;
    onUpdate: (timePercent: number) => void;
    onEnd: () => void;
    /**
     * 设置动画的必要参数
     * @param duration
     * @param loopStart
     * @param loop
     * @param fillValue
     */
    setConfig(duration: number, loopStart: number, loop: number, fillValue: number): void;
    start(): void;
    resume(): boolean;
    pause(): boolean;
    stop(): void;
    private doFrame;
    private doDeltaTime;
}

declare class PNGEncoder {
    private readonly width;
    private readonly height;
    private readonly view;
    private crc32;
    constructor(width: number, height: number);
    private createChunk;
    private createIHDRChunk;
    private createIDATChunk;
    setPixel(x: number, y: number, pixel: number): void;
    write(pixels: Uint8Array | Uint8ClampedArray): this;
    flush(): Uint8Array;
}

/**
 * QRCode实现
 * https://www.cnblogs.com/leestar54/p/15782929.html
 * @param typeNumber 1 to 40
 * @param errorCorrectLevel 'L','M','Q','H'
 */
declare class QRCode {
    private readonly typeNumber;
    private readonly errorCorrectLevel;
    private modules;
    private moduleCount;
    private dataCache;
    private dataList;
    constructor(typeNumber: number, errorCorrectLevel: "L" | "M" | "Q" | "H");
    private makeImpl;
    private setupPositionProbePattern;
    private setupPositionAdjustPattern;
    private setupTimingPattern;
    private setupTypeInfo;
    private getBestMaskPattern;
    private setupTypeNumber;
    private createData;
    private mapData;
    private createBytes;
    isDark(row: number, col: number): boolean;
    addData(data: string): void;
    getModuleCount(): number;
    make(): void;
}

/**
 * An error generated within this library
 */
interface FlateError extends Error {
    /**
     * The code associated with this error
     */
    code: number;
}
/**
 * Options for compressing data into a DEFLATE format
 */
interface DeflateOptions {
    /**
     * The level of compression to use, ranging from 0-9.
     *
     * 0 will store the data without compression.
     * 1 is fastest but compresses the worst, 9 is slowest but compresses the best.
     * The default level is 6.
     *
     * Typically, binary data benefits much more from higher values than text data.
     * In both cases, higher values usually take disproportionately longer than the reduction in final size that results.
     *
     * For example, a 1 MB text file could:
     * - become 1.01 MB with level 0 in 1ms
     * - become 400 kB with level 1 in 10ms
     * - become 320 kB with level 9 in 100ms
     */
    level?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    /**
     * The memory level to use, ranging from 0-12. Increasing this increases speed and compression ratio at the cost of memory.
     *
     * Note that this is exponential: while level 0 uses 4 kB, level 4 uses 64 kB, level 8 uses 1 MB, and level 12 uses 16 MB.
     * It is recommended not to lower the value below 4, since that tends to hurt performance.
     * In addition, values above 8 tend to help very little on most data and can even hurt performance.
     *
     * The default value is automatically determined based on the size of the input data.
     */
    mem?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    /**
     * A buffer containing common byte sequences in the input data that can be used to significantly improve compression ratios.
     *
     * Dictionaries should be 32kB or smaller and include strings or byte sequences likely to appear in the input.
     * The decompressor must supply the same dictionary as the compressor to extract the original data.
     *
     * Dictionaries only improve aggregate compression ratio when reused across multiple small inputs. They should typically not be used otherwise.
     *
     * Avoid using dictionaries with GZIP and ZIP to maximize software compatibility.
     */
    dictionary?: Uint8Array;
}
/**
 * Options for compressing data into a Zlib format
 */
interface ZlibOptions extends DeflateOptions {
}
/**
 * Options for decompressing DEFLATE data
 */
interface InflateOptions {
    /**
     * The dictionary used to compress the original data. If no dictionary was used during compression, this option has no effect.
     *
     * Supplying the wrong dictionary during decompression usually yields corrupt output or causes an invalid distance error.
     */
    dictionary?: Uint8Array;
    /**
     * The buffer into which to write the decompressed data. Saves memory if you know the decompressed size in advance.
     *
     * Note that if the decompression result is larger than the size of this buffer, it will be truncated to fit.
     */
    out?: Uint8Array;
}
/**
 * Options for decompressing Zlib data
 */
interface UnzlibOptions extends InflateOptions {
}
/**
 * Compress data with Zlib
 * @param data The data to compress
 * @param opts The compression options
 * @returns The zlib-compressed version of the data
 */
declare function zlibSync(data: Uint8Array, opts?: ZlibOptions): Uint8Array<ArrayBuffer>;
/**
 * Expands Zlib data
 * @param data The data to decompress
 * @param opts The decompression options
 * @returns The decompressed version of the data
 */
declare function unzlibSync(data: Uint8Array, opts?: UnzlibOptions): Uint8Array<ArrayBufferLike>;

declare const platform: octopus_platform.OctopusPlatform<never> & Pick<octopus_platform.OctopusPlatformPlugins, "getSelector" | "getCanvas" | "getOfsCanvas" | "codec" | "remote" | "local" | "image" | "now" | "path" | "rAF">;

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

/**
 * 将 ImageData 转换为 PNG 格式的 Buffer
 * @param imageData
 * @returns PNG 格式的 Buffer
 */
declare function createBufferOfImageData(imageData: ImageData): Uint8Array<ArrayBufferLike>;
/**
 * @deprecated 请使用 createBufferOfImageData 代替，此方法可能在后续版本中移除
 */
declare const getBufferFromImageData: typeof createBufferOfImageData;
/**
 * 将 ImageData 转换为 PNG 格式的 Base64 字符串
 * @param imageData
 * @returns PNG 格式的 Base64 字符串
 */
declare function createImageDataUrl(imageData: ImageData): string;
/**
 * @deprecated 请使用 createImageDataUrl 代替，此方法可能在后续版本中移除
 */
declare const getDataURLFromImageData: typeof createImageDataUrl;

/**
 * 检查数据是否为zlib压缩格式
 * @param data 待检查的二进制数据
 * @returns 是否为zlib压缩格式
 */
declare function isZlibCompressed(data: Uint8Array): boolean;

type PlatformRenderingContext2D = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
interface RawImages {
    [key: string]: RawImage;
}
interface PlatformImages {
    [key: string]: PlatformImage | ImageBitmap;
}
interface PainterActionModel {
    type: "C" | "O";
    clear: "CL" | "RE";
}
type PainterMode = "dual" | "single";
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
    container: string;
    /**
     * 填充模式，类似于 content-mode。
     */
    contentMode: PLAYER_CONTENT_MODE;
    /**
     * 绘制成海报的帧，默认是0。
     */
    frame: number;
}
type PosterConfigOptions = Partial<PosterConfig>;

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

export { Animator, EllipseArgs, FrameEntity, Layout, MovieEntity, MovieParams, PLAYER_CONTENT_MODE, PLAYER_FILL_MODE, PLAYER_PLAY_MODE, PNGEncoder, Painter, Parser, PlatformVideo, QRCode, RGBAColor, RectArgs, Renderer2D, RendererGL, RendererGLExtension, RendererGPU, RendererGPUExtension, ResourceManager, ShapeArgs, ShapeEntity, ShapeStyle, SpriteEntity, Transform, create2DRenderer, createBestRenderer, createBufferOfImageData, createGLRenderer, createGPURenderer, createImageDataUrl, createRenderer, createVideoEntity, detect2DSupport, detectGLSupport, detectGPUSupport, detectRendererSupport, generateImageBufferFromCode, generateImageFromCode, getBufferFromImageData, getDataURLFromImageData, isZlibCompressed, platform, unzlibSync, zlibSync };
export type { CanvasSize, DeflateOptions, FlateError, GLRendererOptions, GLShader, GPURendererOptions, GPUShader, IQrCodeImgOptions, InflateOptions, PainterActionModel, PainterMode, PlatformImages, PlatformRenderingContext2D, PlayerConfig, PlayerConfigOptions, PlayerEventCallback, PlayerProcessEventCallback, PosterConfig, PosterConfigOptions, PosterEventCallback, RawImages, Renderer2DExtensions, Renderer2DOptions, Renderer2DReturn, RendererInfo, RendererType, TransformScale, UnzlibOptions, ZlibOptions };
