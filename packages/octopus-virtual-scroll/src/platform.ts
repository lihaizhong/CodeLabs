import {
  OctopusPlatform,
  installPlugin,
  type OctopusPlatformPlugins,
  type OctopusPlatformPluginOptions,
  pluginIntersectionObserver,
} from "octopus-platform";

export type PlatformProperties = "walkIn";

class EnhancedPlatform extends OctopusPlatform<PlatformProperties> {
  walkIn!: OctopusPlatformPlugins["walkIn"];

  constructor() {
    super([pluginIntersectionObserver], __VERSION__);

    this.init();
  }

  installPlugin(plugin: OctopusPlatformPluginOptions<PlatformProperties>) {
    installPlugin<PlatformProperties>(this, plugin);
  }
}

export const platform = new EnhancedPlatform();
