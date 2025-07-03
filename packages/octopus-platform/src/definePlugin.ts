import type { OctopusPlatformWithDependencies } from "./platform";
import type { OctopusPlatformPlugins } from "./typings";

/**
 * 平台插件选项接口
 */
export interface OctopusPlatformPluginOptions<
  N extends keyof OctopusPlatformPlugins,
  D extends keyof OctopusPlatformPlugins = never
> {
  name: N;
  dependencies?: D[];
  install: (this: OctopusPlatformWithDependencies<N, D>) => OctopusPlatformPlugins[N];
}

/**
 * 定义平台插件
 */
export const definePlugin = <
  N extends keyof OctopusPlatformPlugins,
  D extends keyof OctopusPlatformPlugins = never
>(
  plugin: OctopusPlatformPluginOptions<N, D>
) => plugin;
