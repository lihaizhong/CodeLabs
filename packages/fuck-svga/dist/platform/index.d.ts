export declare const noop: () => any;
declare class Platform implements IPlatform {
    private plugins;
    global: PlatformGlobal;
    noop: () => any;
    now: () => number;
    path: IPlatform["path"];
    local: IPlatform["local"];
    remote: IPlatform["remote"];
    decode: IPlatform["decode"];
    image: IPlatform["image"];
    rAF: IPlatform["rAF"];
    getCanvas: IPlatform["getCanvas"];
    getOfsCanvas: IPlatform["getOfsCanvas"];
    constructor();
    private init;
    private autoEnv;
    private useBridge;
    private usePixelRatio;
    private useFileSystemManager;
    private useSystem;
    private usePlugins;
    switch(env: SupportedPlatform): void;
}
export declare const platform: Platform;
export {};
