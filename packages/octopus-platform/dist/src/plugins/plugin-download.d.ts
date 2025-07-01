import { OctopusPlatformPlugins } from "../definePlugin";
declare module "../definePlugin" {
    interface OctopusPlatformPlugins {
        remote: {
            is: (url: string) => boolean;
            fetch: (url: string) => Promise<ArrayBuffer>;
        };
    }
}
/**
 * 用于处理远程文件读取
 * @returns
 */
declare const _default: import("../definePlugin").OctopusPlatformPluginOptions<"remote", keyof OctopusPlatformPlugins>;
export default _default;
