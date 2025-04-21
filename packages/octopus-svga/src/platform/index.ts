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
  }

  init() {
    super.init();
    // 确保接口中声明的属性在实例上可用
    // 将原型上的方法赋值给实例属性
    const props = Object.getPrototypeOf(this);

    Object.defineProperties(this, {
      now: { get: () => props.now },
      path: { get: () => props.path },
      remote: { get: () => props.remote },
      local: { get: () => props.local },
      decode: { get: () => props.decode },
      image: { get: () => props.image },
      rAF: { get: () => props.rAF },
      getCanvas: { get: () => props.getCanvas },
      getOfsCanvas: { get: () => props.getOfsCanvas },
    });
  }
}

export const platform = new EnHancedPlatform();
