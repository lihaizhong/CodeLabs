import { PlatformPlugin, PlatformGlobal, SupportedPlatform } from "fuck-platform";
import { retry } from "./extensions";
export * from "./definePlugin";
export * from "./plugins";
export * from "./extensions";
export declare class Platform<P extends string, O> {
    private plugins;
    platformVersion: string;
    version: string;
    global: PlatformGlobal;
    noop: () => any;
    retry: typeof retry;
    constructor(plugins: PlatformPlugin<P, O>[], version?: string);
    private init;
    private autoEnv;
    private useBridge;
    private usePixelRatio;
    private installPlugins;
    switch(env: SupportedPlatform): void;
}
