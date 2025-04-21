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
  | "rAF"
  | "getCanvas"
  | "getOfsCanvas";

class SvgaPlatform extends OctopusPlatform<PlatformProperties> {
  // 为每个插件属性添加明确的类型声明
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
