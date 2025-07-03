import type { OctopusPlatformWithDependencies } from "./platform";// 修改接口定义
export interface OctopusPlatformPluginOptions<
  N extends keyof OctopusPlatformPlugins,
  D extends keyof OctopusPlatformPlugins = never
> {
  name: N;
  dependencies?: D[];
  install: (this: OctopusPlatformWithDependencies<N, D>) => OctopusPlatformPlugins[N];
}

// 修改函数定义
export const definePlugin = <
  N extends keyof OctopusPlatformPlugins,
  D extends keyof OctopusPlatformPlugins = never
>(
  plugin: OctopusPlatformPluginOptions<N, D>
) => plugin;
