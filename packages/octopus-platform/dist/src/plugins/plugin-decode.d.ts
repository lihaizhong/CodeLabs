import { OctopusPlatformPlugins } from "../definePlugin";
declare module "../definePlugin" {
    interface OctopusPlatformPlugins {
        decode: {
            toDataURL: (data: Uint8Array) => string;
            toBuffer: (data: Uint8Array) => ArrayBuffer;
            bytesToString: (data: Uint8Array) => string;
            utf8: (data: Uint8Array, start: number, end: number) => string;
        };
    }
}
/**
 * 用于处理数据解码
 * @returns
 */
declare const _default: import("../definePlugin").OctopusPlatformPluginOptions<"decode", keyof OctopusPlatformPlugins>;
export default _default;
