import {
  OctopusPlatform,
  installPlugin,
  type OctopusPlatformPlugins,
  type OctopusPlatformPluginOptions,
  pluginNow,
} from "octopus-platform";

export type PlatformProperties = "now";

class EnhancedPlatform extends OctopusPlatform<PlatformProperties> {
  now!: OctopusPlatformPlugins["now"];

  constructor() {
    super([pluginNow], __VERSION__);

    this.init();
  }

  installPlugin(plugin: OctopusPlatformPluginOptions<PlatformProperties>) {
    installPlugin<PlatformProperties>(this, plugin);
  }
}

export const platform = new EnhancedPlatform();
