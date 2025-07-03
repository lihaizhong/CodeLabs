import { OctopusPlatform, OctopusPlatformPlugins, pluginNow } from "octopus-platform";
import { version } from "../package.json";

export type PlatformProperties = "now";

class EnhancedPlatform extends OctopusPlatform<"now"> {
  now!: OctopusPlatformPlugins;

  constructor() {
    super([pluginNow], version);

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
