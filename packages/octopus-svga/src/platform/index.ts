import {
  type OctopusPlatformPlugins,
  type OctopusPlatformPluginOptions,
  OctopusPlatform,
  installPlugin,
  pluginSelector,
  pluginCanvas,
  pluginOfsCanvas,
  pluginDecode,
  pluginDownload,
  pluginFsm,
  pluginImage,
  pluginNow,
  pluginPath,
  pluginRAF,
} from "octopus-platform";

export type PlatformProperties =
  | "now"
  | "path"
  | "remote"
  | "local"
  | "decode"
  | "image"
  | "rAF"
  | "getSelector"
  | "getCanvas"
  | "getOfsCanvas";

class EnhancedPlatform extends OctopusPlatform<PlatformProperties> {
  now!: OctopusPlatformPlugins["now"];

  path!: OctopusPlatformPlugins["path"];

  remote!: OctopusPlatformPlugins["remote"];

  local!: OctopusPlatformPlugins["local"];

  decode!: OctopusPlatformPlugins["decode"];

  image!: OctopusPlatformPlugins["image"];

  rAF!: OctopusPlatformPlugins["rAF"];

  getSelector!: OctopusPlatformPlugins["getSelector"];

  getCanvas!: OctopusPlatformPlugins["getCanvas"];

  getOfsCanvas!: OctopusPlatformPlugins["getOfsCanvas"];

  constructor() {
    super(
      [
        pluginSelector,
        pluginCanvas,
        pluginOfsCanvas,
        pluginDecode,
        pluginDownload,
        pluginFsm,
        pluginImage,
        pluginNow,
        pluginPath,
        pluginRAF,
      ],
      __VERSION__
    );

    this.init();
  }

  installPlugin(
    plugin: OctopusPlatformPluginOptions<PlatformProperties>
  ) {
    installPlugin<PlatformProperties>(this, plugin);
  }
}

export const platform = new EnhancedPlatform();
