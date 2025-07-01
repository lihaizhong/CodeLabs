import type { OctopusPlatform } from "./platform";
export interface OctopusPlatformPluginOptions<N extends keyof OctopusPlatformPlugins, R extends keyof OctopusPlatformPlugins = keyof OctopusPlatformPlugins> {
    name: N;
    dependencies?: R[];
    install: (this: OctopusPlatform<N | R>) => OctopusPlatformPlugins[N];
}
export interface OctopusPlatformPlugins {
}
export declare const definePlugin: <N extends keyof OctopusPlatformPlugins, R extends keyof OctopusPlatformPlugins = keyof OctopusPlatformPlugins>(plugin: OctopusPlatformPluginOptions<N, R>) => OctopusPlatformPluginOptions<N, R>;
