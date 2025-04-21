import { PlatformGlobal, SupportedPlatform, PlatformPluginOptions, PlatformPluginProperty, Platform } from "./types";
import { retry } from "./extensions";
export declare class OctopusPlatform<P extends PlatformPluginProperty> implements Platform<P> {
    private plugins;
    platformVersion: string;
    version: string;
    global: PlatformGlobal;
    noop: () => any;
    retry: typeof retry;
    constructor(plugins: PlatformPluginOptions<P>[], version?: string);
    protected init(): void;
    private autoEnv;
    private useBridge;
    private usePixelRatio;
    private installPlugins;
    switch(env: SupportedPlatform): void;
}
