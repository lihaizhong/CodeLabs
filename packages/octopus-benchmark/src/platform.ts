import {
  OctopusPlatform,
  type OctopusPlatformPlugins,
  type OctopusPlatformPluginOptions,
  pluginNow,
} from "octopus-platform";
import { version } from "../package.json";

export type PlatformProperties = "now";

class EnhancedPlatform extends OctopusPlatform<PlatformProperties> {
  now!: OctopusPlatformPlugins["now"];

  constructor() {
    super([pluginNow], version);

    this.init();
  }

  installPlugin(plugin: OctopusPlatformPluginOptions<PlatformProperties>) {
    const value = plugin.install.call(this);

    Object.defineProperty(this, plugin.name, {
      get: () => value,
      enumerable: true,
      configurable: true,
    });
  }
}

export const platform = new EnhancedPlatform();
