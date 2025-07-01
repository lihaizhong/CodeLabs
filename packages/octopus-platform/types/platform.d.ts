import type { OctopusPlatformPluginOptions, OctopusPlatformPlugins } from "./definePlugin";
export type OctopusSupportedPlatform = "weapp" | "alipay" | "tt" | "h5" | "unknown";
export interface OctopusPlatformGlobals {
    env: OctopusSupportedPlatform;
    br: any;
    dpr: number;
    system: string;
}
export declare abstract class OctopusPlatform<N extends keyof OctopusPlatformPlugins> {
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
    retry: any;
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
