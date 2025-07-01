import { OctopusPlatformPlugins } from "../definePlugin";
declare module "../definePlugin" {
    interface OctopusPlatformPlugins {
        local: {
            write: (data: ArrayBufferLike, filepath: string) => Promise<string>;
            read: (filepath: string) => Promise<ArrayBuffer>;
            remove: (filepath: string) => Promise<string>;
        } | null;
    }
}
/**
 * 用于处理本地文件存储
 * @returns
 */
declare const _default: import("../definePlugin").OctopusPlatformPluginOptions<"local", keyof OctopusPlatformPlugins>;
export default _default;
