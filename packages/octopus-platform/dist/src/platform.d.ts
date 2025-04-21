import { PlatformGlobals, SupportedPlatform, PlatformPluginOptions, PlatformPluginProperty, Platform } from "./types";
import { retry } from "./extensions";
export declare abstract class OctopusPlatform<P extends PlatformPluginProperty> implements Platform<P> {
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
    globals: PlatformGlobals;
    noop: () => any;
    retry: typeof retry;
    constructor(plugins: PlatformPluginOptions<P>[], version?: string);
    protected init(): void;
    private autoEnv;
    private useBridge;
    private usePixelRatio;
    private usePlugins;
    abstract installPlugin(plugin: PlatformPluginOptions<P>): void;
    switch(env: SupportedPlatform): void;
}
