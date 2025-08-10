# Octopus Platform

`octopus-platform` 是一个支持多端兼容的跨平台模板。使用插件化机制，支持扩展API。

## 实现

- [x] 插件化配置
- [x] 兼容H5端/微信小程序/支付宝小程序/抖音小程序（已验证）

## 暂未实现

- [ ] 兼容淘宝小程序
- [ ] 支持 `IndexDB`
- [ ] 支持 `IntersectionObserver`

## 安装

```bash
npm install octopus-platform -S
```

## 使用

### 创建 platform 类

```ts
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
```

### platform 版本信息

```ts
// 当前库的版本
platform.platformVersion
// 使用这个库的应用版本
platform.version
```

### platform 全局信息

```ts
// 当前在哪个平台（微信小程序、支付宝小程序、H5）
platform.globals.env
// 当前平台的全局对象（wx、my、window）
platform.globals.br
// 当前设备的设备像素比
platform.globals.dpr
```

### 自定义插件

```ts
import { definePlugin } from "octopus-platform";

export default definePlugin<"now">({  
  name: "now",
  install() {
    const { env, br } = this.globals;
    // performance可以提供更高精度的时间测量，且不受系统时间的调整（如更改系统时间或同步时间）的影响
    const perf =
      env === "h5" || env === "tt" ? performance : br.getPerformance();

    if (typeof perf?.now === "function") {
      // 支付宝小程序的performance.now()获取的是当前时间戳，单位是微秒。
      if (perf.now() - Date.now() > 1) {
        return () => perf.now() / 1000;
      }

      // H5环境下，performance.now()获取的不是当前时间戳，而是从页面加载开始的时间戳，单位是毫秒。
      return () => perf.now();
    }

    return () => Date.now();
  },
});

// 安装插件参考上面的 OctopusPlatform 实现

platform.now()
```

## LICENSE

[MIT](./LICENSE)
