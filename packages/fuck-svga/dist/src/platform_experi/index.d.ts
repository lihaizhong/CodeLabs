import { OctopusPlatform, PlatformPlugin } from "octopus-platform";
export type PlatformProperties = "now" | "path" | "remote" | "local" | "decode" | "image" | "rAF" | "getCanvas" | "getOfsCanvas";
declare class SvgaPlatform extends OctopusPlatform<PlatformProperties> {
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
}
export declare const platform: SvgaPlatform;
export {};
