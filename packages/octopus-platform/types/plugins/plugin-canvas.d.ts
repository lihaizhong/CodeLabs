import { PlatformCanvas } from "../typings";
export interface GetCanvasResult {
    canvas: PlatformCanvas;
    context: CanvasRenderingContext2D;
}
declare module "../definePlugin" {
    interface OctopusPlatformPlugins {
        getCanvas: (selector: string, component?: any) => Promise<GetCanvasResult>;
    }
}
/**
 * 通过选择器匹配获取canvas实例
 * @returns
 */
declare const _default: import("../definePlugin").OctopusPlatformPluginOptions<"getCanvas", keyof import("../definePlugin").OctopusPlatformPlugins>;
export default _default;
