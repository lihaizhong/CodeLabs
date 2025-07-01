import { OffscreenCanvasOptions, PlatformOffscreenCanvas } from "../typings";
export interface GetOffscreenCanvasResult {
    canvas: PlatformOffscreenCanvas;
    context: OffscreenCanvasRenderingContext2D;
}
declare module "../definePlugin" {
    interface OctopusPlatformPlugins {
        getOfsCanvas: (options: OffscreenCanvasOptions) => GetOffscreenCanvasResult;
    }
}
/**
 * 用于创建离屏canvas
 * @returns
 */
declare const _default: import("../definePlugin").OctopusPlatformPluginOptions<"getOfsCanvas", keyof import("../definePlugin").OctopusPlatformPlugins>;
export default _default;
