import {
  OctopusPlatform,
  installPlugin,
  type OctopusPlatformPlugins,
  type OctopusPlatformPluginOptions,
  pluginCanvas,
  pluginDecode,
  pluginDownload,
  pluginFsm,
  pluginImage,
  pluginNow,
  pluginOfsCanvas,
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

  getCanvas!: OctopusPlatformPlugins["getCanvas"];

  getOfsCanvas!: OctopusPlatformPlugins["getOfsCanvas"];

  constructor() {
    super(
      [
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
