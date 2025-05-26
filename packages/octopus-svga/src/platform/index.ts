import {
  Platform,
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
import { version } from "../../package.json";
// import benchmark from "../benchmark";

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

class EnhancedPlatform extends Platform<PlatformProperties> {
  now!: OctopusPlatform.PlatformPlugin["now"];

  path!: OctopusPlatform.PlatformPlugin["path"];

  remote!: OctopusPlatform.PlatformPlugin["remote"];

  local!: OctopusPlatform.PlatformPlugin["local"];

  decode!: OctopusPlatform.PlatformPlugin["decode"];

  image!: OctopusPlatform.PlatformPlugin["image"];

  rAF!: OctopusPlatform.PlatformPlugin["rAF"];

  getCanvas!: OctopusPlatform.PlatformPlugin["getCanvas"];

  getOfsCanvas!: OctopusPlatform.PlatformPlugin["getOfsCanvas"];

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
      version
    );

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

// benchmark.log(
//   "PLATFORM VERSION",
//   platform.platformVersion,
//   "VERSION",
//   platform.version
// );
