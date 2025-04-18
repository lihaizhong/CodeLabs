import { retry } from "./extensions";
export declare class Platform<P extends string, O> implements FuckPlatform.Platform<P, O> {
    private plugins;
    version: string;
    global: FuckPlatform.PlatformGlobal;
    noop: () => any;
    retry: typeof retry;
    constructor(plugins: FuckPlatform.PlatformPlugin<P, O>[]);
    private init;
    private autoEnv;
    private useBridge;
    private usePixelRatio;
    private installPlugins;
    switch(env: FuckPlatform.SupportedPlatform): void;
}
