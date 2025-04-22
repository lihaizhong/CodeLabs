import {
  OctopusPlatform,
  PlatformPlugin,
  PlatformPluginOptions,
  PlatformPluginValue,
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
import benchmark from "../benchmark";

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

class EnHancedPlatform extends OctopusPlatform<PlatformProperties> {
  now!: PlatformPlugin["now"];
  path!: PlatformPlugin["path"];
  remote!: PlatformPlugin["remote"];
  local!: PlatformPlugin["local"];
  decode!: PlatformPlugin["decode"];
  image!: PlatformPlugin["image"];
  rAF!: PlatformPlugin["rAF"];
  getCanvas!: PlatformPlugin["getCanvas"];
  getOfsCanvas!: PlatformPlugin["getOfsCanvas"];

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

  installPlugin(plugin: PlatformPluginOptions<PlatformProperties>) {
    const value = plugin.install.call<
      EnHancedPlatform,
      [],
      PlatformPluginValue<PlatformProperties>
    >(this);

    Object.defineProperty(this, plugin.name, {
      get() {
        return value;
      },
      enumerable: true,
      configurable: true,
    });
  }
}

export const platform = new EnHancedPlatform();

benchmark.log('PLATFORM VERSION', platform.platformVersion, 'VERSION', platform.version);
