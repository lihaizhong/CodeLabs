import type { OctopusPlatformWithDependencies } from "./platform";

/**
 * 平台插件接口
 * 各个插件通过 declare module 语法扩展此接口
 */
export interface OctopusPlatformPlugins {}

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
