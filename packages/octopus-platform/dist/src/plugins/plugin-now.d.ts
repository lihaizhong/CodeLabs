declare module "../definePlugin" {
    interface OctopusPlatformPlugins {
        now: () => number;
    }
}
declare const _default: import("../definePlugin").OctopusPlatformPluginOptions<"now", keyof import("../definePlugin").OctopusPlatformPlugins>;
export default _default;
