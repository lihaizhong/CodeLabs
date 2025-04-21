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

    // 确保接口中声明的属性在实例上可用
    // 将原型上的方法赋值给实例属性
    Object.defineProperties(this, {
      now: { get: () => Object.getPrototypeOf(this).now },
      path: { get: () => Object.getPrototypeOf(this).path },
      remote: { get: () => Object.getPrototypeOf(this).remote },
      local: { get: () => Object.getPrototypeOf(this).local },
      decode: { get: () => Object.getPrototypeOf(this).decode },
      image: { get: () => Object.getPrototypeOf(this).image },
      rAF: { get: () => Object.getPrototypeOf(this).rAF },
      getCanvas: { get: () => Object.getPrototypeOf(this).getCanvas },
      getOfsCanvas: { get: () => Object.getPrototypeOf(this).getOfsCanvas },
    });
  }
}

export const platform = new EnHancedPlatform();
