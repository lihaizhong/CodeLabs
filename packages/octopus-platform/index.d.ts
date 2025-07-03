import * as octopus_platform from 'octopus-platform';

declare function retry<T>(fn: () => T | Promise<T>, intervals?: number[], times?: number): Promise<T>;

interface MiniProgramCanvas extends HTMLCanvasElement {
    createImage(): HTMLImageElement;
    requestAnimationFrame(callback: () => void): number;
}
type PlatformCanvas = MiniProgramCanvas | HTMLCanvasElement;
interface MiniProgramOffscreenCanvas extends OffscreenCanvas {
    createImage(): HTMLImageElement;
}
type PlatformOffscreenCanvas = MiniProgramOffscreenCanvas | OffscreenCanvas;
interface OffscreenCanvasOptions {
    width: number;
    height: number;
    type?: "2d" | "webgl";
}
interface MiniProgramImage extends HTMLImageElement {
    width: number;
    height: number;
}
type PlatformImage = MiniProgramImage | HTMLImageElement;
type Bitmap = PlatformImage | ImageBitmap | HTMLCanvasElement | OffscreenCanvas;
type RawImage = string | Uint8Array;
interface GetCanvasResult {
    canvas: PlatformCanvas;
    context: CanvasRenderingContext2D;
}
interface GetOffscreenCanvasResult {
    canvas: PlatformOffscreenCanvas;
    context: OffscreenCanvasRenderingContext2D;
}
/**
 * 平台插件接口
 * 各个插件通过 declare module 语法扩展此接口
 */
interface OctopusPlatformPlugins {
    getCanvas: (selector: string, component?: any) => Promise<GetCanvasResult>;
    getOfsCanvas: (options: OffscreenCanvasOptions) => GetOffscreenCanvasResult;
    now: () => number;
    rAF: (canvas: PlatformCanvas, callback: () => void) => number;
    decode: {
        toDataURL: (data: Uint8Array) => string;
        toBuffer: (data: Uint8Array) => ArrayBuffer;
        bytesToString: (data: Uint8Array) => string;
        utf8: (data: Uint8Array, start: number, end: number) => string;
    };
    remote: {
        is: (url: string) => boolean;
        fetch: (url: string) => Promise<ArrayBuffer>;
    };
    local: {
        write: (data: ArrayBufferLike, filepath: string) => Promise<string>;
        read: (filepath: string) => Promise<ArrayBuffer>;
        remove: (filepath: string) => Promise<string>;
    } | null;
    image: {
        create: (canvas: PlatformCanvas | PlatformOffscreenCanvas) => PlatformImage;
        load: (createImage: () => HTMLImageElement, data: ImageBitmap | Uint8Array | string, filepath: string) => Promise<ImageBitmap | PlatformImage>;
        release: (img: PlatformImage) => void;
    };
    path: {
        USER_DATA_PATH: string;
        is: (filepath: string) => boolean;
        filename: (filepath: string) => string;
        resolve: (name: string, prefix?: string) => string;
    };
}

/**
 * 平台插件选项接口
 */
interface OctopusPlatformPluginOptions<N extends keyof OctopusPlatformPlugins, D extends keyof OctopusPlatformPlugins = never> {
    name: N;
    dependencies?: D[];
    install: (this: OctopusPlatformWithDependencies<N, D>) => OctopusPlatformPlugins[N];
}
/**
 * 定义平台插件
 */
declare const definePlugin: <N extends keyof octopus_platform.OctopusPlatformPlugins, D extends keyof octopus_platform.OctopusPlatformPlugins = never>(plugin: OctopusPlatformPluginOptions<N, D>) => OctopusPlatformPluginOptions<N, D>;

type OctopusSupportedPlatform = "weapp" | "alipay" | "tt" | "h5" | "unknown";
interface OctopusPlatformGlobals {
    env: OctopusSupportedPlatform;
    br: any;
    dpr: number;
    system: string;
}
type OctopusPlatformWithDependencies<N extends keyof octopus_platform.OctopusPlatformPlugins, D extends keyof octopus_platform.OctopusPlatformPlugins = never> = OctopusPlatform<N> & {
    [K in D]: octopus_platform.OctopusPlatformPlugins[K];
};
declare abstract class OctopusPlatform<N extends keyof octopus_platform.OctopusPlatformPlugins> {
    /**
     * 插件列表
     */
    private plugins;
    /**
     * 平台版本
     */
    platformVersion: string;
    /**
     * 应用版本
     */
    version: string;
    /**
     * 全局变量
     */
    globals: OctopusPlatformGlobals;
    noop: <T = any>() => T | void;
    retry: typeof retry;
    constructor(plugins: OctopusPlatformPluginOptions<N>[], version?: string);
    protected init(): void;
    private autoEnv;
    private useBridge;
    private usePixelRatio;
    private useSystem;
    private usePlugins;
    abstract installPlugin(plugin: OctopusPlatformPluginOptions<N>): void;
    switch(env: OctopusSupportedPlatform): void;
}

/**
 * 通过选择器匹配获取canvas实例
 * @returns
 */
declare const _default$8: OctopusPlatformPluginOptions<"getCanvas", never>;

/**
 * 用于处理数据解码
 * @returns
 */
declare const _default$7: OctopusPlatformPluginOptions<"decode", never>;

/**
 * 用于处理远程文件读取
 * @returns
 */
declare const _default$6: OctopusPlatformPluginOptions<"remote", never>;

/**
 * 用于处理本地文件存储
 * @returns
 */
declare const _default$5: OctopusPlatformPluginOptions<"local", never>;

/**
 * 图片加载插件
 * @package plugin-fsm 本地文件存储能力
 * @package plugin-path 路径处理能力
 * @package plugin-decode 解码能力
 */
declare const _default$4: OctopusPlatformPluginOptions<"image", "decode" | "local">;

declare const _default$3: OctopusPlatformPluginOptions<"now", never>;

/**
 * 用于创建离屏canvas
 * @returns
 */
declare const _default$2: OctopusPlatformPluginOptions<"getOfsCanvas", never>;

/**
 * 用于处理文件路径
 * @returns
 */
declare const _default$1: OctopusPlatformPluginOptions<"path", never>;

/**
 * 用于处理requestAnimationFrame
 * @returns
 */
declare const _default: OctopusPlatformPluginOptions<"rAF", never>;

export { OctopusPlatform, definePlugin, _default$8 as pluginCanvas, _default$7 as pluginDecode, _default$6 as pluginDownload, _default$5 as pluginFsm, _default$4 as pluginImage, _default$3 as pluginNow, _default$2 as pluginOfsCanvas, _default$1 as pluginPath, _default as pluginRAF };
export type { Bitmap, GetCanvasResult, GetOffscreenCanvasResult, MiniProgramCanvas, MiniProgramImage, MiniProgramOffscreenCanvas, OctopusPlatformGlobals, OctopusPlatformPluginOptions, OctopusPlatformPlugins, OctopusPlatformWithDependencies, OctopusSupportedPlatform, OffscreenCanvasOptions, PlatformCanvas, PlatformImage, PlatformOffscreenCanvas, RawImage };
