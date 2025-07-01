import { PlatformCanvas } from "../typings";
declare module "../definePlugin" {
    interface OctopusPlatformPlugins {
        rAF: (canvas: PlatformCanvas, callback: () => void) => number;
    }
}
/**
 * 用于处理requestAnimationFrame
 * @returns
 */
declare const _default: import("../definePlugin").OctopusPlatformPluginOptions<"rAF", keyof import("../definePlugin").OctopusPlatformPlugins>;
export default _default;
