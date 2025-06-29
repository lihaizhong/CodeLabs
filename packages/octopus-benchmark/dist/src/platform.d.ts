import { Platform } from "octopus-platform";
export type PlatformProperties = "now" | "system";
declare class EnhancedPlatform extends Platform<PlatformProperties> {
    now: OctopusPlatform.PlatformPlugin["now"];
    system: OctopusPlatform.PlatformPlugin["system"];
    constructor();
    installPlugin(plugin: OctopusPlatform.PlatformPluginOptions<PlatformProperties>): void;
}
export declare const platform: EnhancedPlatform;
export {};
