export declare const noop: () => any;
export declare class Platform implements SVGAPlatform {
    private plugins;
    global: SVGAPlatformGlobal;
    noop: () => any;
    now: () => number;
    local: SVGAPlatform["local"];
    remote: SVGAPlatform["remote"];
    decode: SVGAPlatform["decode"];
    image: SVGAPlatform["image"];
    rAF: SVGAPlatform["rAF"];
    getCanvas: SVGAPlatform["getCanvas"];
    getOfsCanvas: SVGAPlatform["getOfsCanvas"];
    constructor();
    private init;
    private autoEnv;
    private useBridge;
    private usePixelRatio;
    private useFileSystemManager;
    private useSystem;
    private usePlugins;
    setEnv(env: SupportedEnv): void;
}
