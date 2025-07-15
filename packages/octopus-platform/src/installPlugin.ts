import type { OctopusPlatformWithDependencies } from "./platform";
import type { OctopusPlatformPluginOptions } from "./definePlugin";
import type { OctopusPlatformPlugins } from "./typings";

export function installPlugin<Props extends keyof OctopusPlatformPlugins>(
  platform: OctopusPlatformWithDependencies<Props, never>,
  plugin: OctopusPlatformPluginOptions<Props>
) {
  const value = plugin.install.call(platform);

  Object.defineProperty(platform, plugin.name, {
    get: () => value,
    enumerable: true,
    configurable: true,
  });
}
