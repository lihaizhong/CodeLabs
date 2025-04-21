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
  public now!: PlatformPlugin["now"];

  public path!: PlatformPlugin["path"];

  public remote!: PlatformPlugin["remote"];

  public local!: PlatformPlugin["local"];

  public decode!: PlatformPlugin["decode"];

  public image!: PlatformPlugin["image"];

  public rAF!: PlatformPlugin["rAF"];

  public getCanvas!: PlatformPlugin["getCanvas"];

  public getOfsCanvas!: PlatformPlugin["getOfsCanvas"];

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
  }
}

export const platform = new SvgaPlatform();
