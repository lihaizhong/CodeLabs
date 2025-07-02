import type { OctopusPlatform } from "./platform";

export interface OctopusPlatformPluginOptions<
  N extends keyof OctopusPlatformPlugins
> {
  name: N;
  dependencies?: N[];
  install: (this: OctopusPlatform<N>) => OctopusPlatformPlugins[N];
}

export interface OctopusPlatformPlugins {}

export const definePlugin = <N extends keyof OctopusPlatformPlugins>(
  plugin: OctopusPlatformPluginOptions<N>
) => plugin;
