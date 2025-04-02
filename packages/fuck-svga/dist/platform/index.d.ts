export declare const noop: () => any;
declare class Platform implements FuckSvga.Platform {
    private plugins;
    global: FuckSvga.PlatformGlobal;
    noop: () => any;
    now: FuckSvga.Platform["now"];
    path: FuckSvga.Platform["path"];
    local: FuckSvga.Platform["local"];
    remote: FuckSvga.Platform["remote"];
    decode: FuckSvga.Platform["decode"];
    image: FuckSvga.Platform["image"];
    rAF: FuckSvga.Platform["rAF"];
    getCanvas: FuckSvga.Platform["getCanvas"];
    getOfsCanvas: FuckSvga.Platform["getOfsCanvas"];
    constructor();
    private init;
    private autoEnv;
    private useBridge;
    private usePixelRatio;
    private useFileSystemManager;
    private useSystem;
    private usePlugins;
    switch(env: FuckSvga.SupportedPlatform): void;
}
export declare const platform: Platform;
export {};
