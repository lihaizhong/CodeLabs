# Octopus Platform

`octopus-platform` 是一个支持多端兼容的跨平台模板。使用插件化机制，支持扩展API。

## 安装

```bash
npm install octopus-platform -S
```

## 使用

```ts
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
      get() {
        return value;
      },
      enumerable: true,
      configurable: true,
    });
  }
}

export const platform = new EnhancedPlatform();
```

## LICENSE

[MIT](./LICENSE)
