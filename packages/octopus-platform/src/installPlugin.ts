import type { OctopusPlatformWithDependencies } from "./platform";
import type { OctopusPlatformPluginOptions } from "./definePlugin";
import type { OctopusPlatformPlugins } from "./typings";

export function installPlugin<Props extends keyof OctopusPlatformPlugins>(
  self: OctopusPlatformWithDependencies<Props, never>,
  plugin: OctopusPlatformPluginOptions<Props>
) {
  const value = plugin.install.call(self);

  Object.defineProperty(self, plugin.name, {
    get: () => value,
    enumerable: true,
    configurable: true,
  });
}
