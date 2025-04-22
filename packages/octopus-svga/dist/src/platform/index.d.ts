import { OctopusPlatform, PlatformPlugin, PlatformPluginOptions } from "octopus-platform";
export type PlatformProperties = "now" | "path" | "remote" | "local" | "decode" | "image" | "rAF" | "getCanvas" | "getOfsCanvas";
declare module "octopus-platform" {
    interface Platform {
        now: PlatformPlugin["now"];
        path: PlatformPlugin["path"];
        remote: PlatformPlugin["remote"];
        local: PlatformPlugin["local"];
        decode: PlatformPlugin["decode"];
        image: PlatformPlugin["image"];
        rAF: PlatformPlugin["rAF"];
        getCanvas: PlatformPlugin["getCanvas"];
        getOfsCanvas: PlatformPlugin["getOfsCanvas"];
    }
}
declare class EnHancedPlatform extends OctopusPlatform<PlatformProperties> {
    now: PlatformPlugin["now"];
    path: PlatformPlugin["path"];
    remote: PlatformPlugin["remote"];
    local: PlatformPlugin["local"];
    decode: PlatformPlugin["decode"];
    image: PlatformPlugin["image"];
    rAF: PlatformPlugin["rAF"];
    getCanvas: PlatformPlugin["getCanvas"];
    getOfsCanvas: PlatformPlugin["getOfsCanvas"];
    constructor();
    installPlugin(plugin: PlatformPluginOptions<PlatformProperties>): void;
}
export declare const platform: EnHancedPlatform;
export {};
