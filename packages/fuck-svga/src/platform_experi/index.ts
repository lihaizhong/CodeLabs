import {
  OctopusPlatform,
  PlatformPlugin,
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

export type PlatformProperties =
  | "now"
  | "path"
  | "remote"
  | "local"
  | "decode"
  | "image"
  | "intersectionObserver"
  | "rAF"
  | "getCanvas"
  | "getOfsCanvas";

class SvgaPlatform extends OctopusPlatform<PlatformProperties> {
  getCanvas: PlatformPlugin["getCanvas"]

  constructor() {
    super(
      [
        pluginCanvas,
        pluginDecode,
        pluginDownload,
        pluginFsm,
        pluginImage,
        pluginNow,
        pluginOfsCanvas,
        pluginPath,
        pluginRAF,
      ],
      version
    );
  }
}

export const platform = new SvgaPlatform();
