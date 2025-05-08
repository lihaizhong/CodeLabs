import { Platform } from "octopus-platform";
export type PlatformProperties = "now" | "path" | "remote" | "local" | "decode" | "image" | "rAF" | "getCanvas" | "getOfsCanvas";
declare class EnhancedPlatform extends Platform<PlatformProperties> {
    now: OctopusPlatform.PlatformPlugin["now"];
    path: OctopusPlatform.PlatformPlugin["path"];
    remote: OctopusPlatform.PlatformPlugin["remote"];
    local: OctopusPlatform.PlatformPlugin["local"];
    decode: OctopusPlatform.PlatformPlugin["decode"];
    image: OctopusPlatform.PlatformPlugin["image"];
    rAF: OctopusPlatform.PlatformPlugin["rAF"];
    getCanvas: OctopusPlatform.PlatformPlugin["getCanvas"];
    getOfsCanvas: OctopusPlatform.PlatformPlugin["getOfsCanvas"];
    constructor();
    installPlugin(plugin: OctopusPlatform.PlatformPluginOptions<PlatformProperties>): void;
}
export declare const platform: EnhancedPlatform;
export {};
