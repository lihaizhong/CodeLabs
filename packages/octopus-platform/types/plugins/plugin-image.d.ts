import { PlatformCanvas, PlatformImage, PlatformOffscreenCanvas } from "../typings";
declare module "../definePlugin" {
    interface OctopusPlatformPlugins {
        image: {
            create: (canvas: PlatformCanvas | PlatformOffscreenCanvas) => PlatformImage;
            load: (createImage: () => HTMLImageElement, data: ImageBitmap | Uint8Array | string, filepath: string) => Promise<ImageBitmap | PlatformImage>;
            release: (img: PlatformImage) => void;
        };
    }
}
/**
 * 图片加载插件
 * @package plugin-fsm 本地文件存储能力
 * @package plugin-path 路径处理能力
 * @package plugin-decode 解码能力
 */
declare const _default: import("../definePlugin").OctopusPlatformPluginOptions<"image", "decode" | "local">;
export default _default;
