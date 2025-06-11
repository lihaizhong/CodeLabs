export declare abstract class Platform<P extends OctopusPlatform.PlatformPluginProperty> implements OctopusPlatform.Platform {
    /**
     * 插件列表
     */
    private plugins;
    private globalCanvas;
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
    globals: OctopusPlatform.PlatformGlobals;
    noop: () => any;
    retry: <T>(fn: () => T | Promise<T>, intervals?: number[], times?: number) => Promise<T>;
    constructor(plugins: OctopusPlatform.PlatformPluginOptions<P>[], version?: string);
    protected init(): void;
    private autoEnv;
    private useBridge;
    private usePixelRatio;
    private usePlugins;
    abstract installPlugin(plugin: OctopusPlatform.PlatformPluginOptions<P>): void;
    setGlobalCanvas(canvas: OctopusPlatform.PlatformCanvas | OctopusPlatform.PlatformOffscreenCanvas | null): void;
    getGlobalCanvas(): OctopusPlatform.PlatformCanvas | OctopusPlatform.PlatformOffscreenCanvas;
    switch(env: OctopusPlatform.SupportedPlatform): void;
}
