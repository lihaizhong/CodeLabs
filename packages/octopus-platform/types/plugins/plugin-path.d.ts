import { OctopusPlatformPlugins } from "../definePlugin";
declare module "../definePlugin" {
    interface OctopusPlatformPlugins {
        path: {
            USER_DATA_PATH: string;
            is: (filepath: string) => boolean;
            filename: (filepath: string) => string;
            resolve: (name: string, prefix?: string) => string;
        };
    }
}
/**
 * 用于处理文件路径
 * @returns
 */
declare const _default: import("../definePlugin").OctopusPlatformPluginOptions<"path", keyof OctopusPlatformPlugins>;
export default _default;
