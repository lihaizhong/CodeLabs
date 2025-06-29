import { Platform, pluginNow, pluginSystem } from "octopus-platform";
import { version } from "../package.json";

export type PlatformProperties = "now" | "system";

class EnhancedPlatform extends Platform<PlatformProperties> {
  now!: OctopusPlatform.PlatformPlugin["now"];

  system!: OctopusPlatform.PlatformPlugin["system"];

  constructor() {
    super([pluginNow, pluginSystem], version);

    this.init();
  }

  installPlugin(
    plugin: OctopusPlatform.PlatformPluginOptions<PlatformProperties>
  ) {
    const value = plugin.install.call<
      EnhancedPlatform,
      [],
      OctopusPlatform.PlatformPluginValue<PlatformProperties>
    >(this);

    Object.defineProperty(this, plugin.name, {
      get: () => value,
      enumerable: true,
      configurable: true,
    });
  }
}

export const platform = new EnhancedPlatform();
