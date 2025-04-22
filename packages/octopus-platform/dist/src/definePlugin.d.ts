import { PlatformPluginProperty, PlatformPluginOptions } from "./types";
export declare const definePlugin: <T extends PlatformPluginProperty>(plugin: PlatformPluginOptions<T>) => PlatformPluginOptions<T>;
