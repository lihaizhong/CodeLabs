import pluginPath from "./plugins/plugin-path";
import pluginNow from "./plugins/plugin-now";
import pluginDecode from "./plugins/plugin-decode";
import pluginDownload from "./plugins/plugin-download";
import pluginCanvas from "./plugins/plugin-canvas";
import pluginOfsCanvas from "./plugins/plugin-ofs-canvas";
import pluginImage from "./plugins/plugin-image";
import pluginRaf from "./plugins/plugin-raf";
import pluginFsm from "./plugins/plugin-fsm";

export const noop: () => any = () => {};

export async function retry<T>(
  fn: () => T,
  intervals: number[] = [],
  times: number = 0
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (times >= intervals.length) {
      throw err;
    }

    return new Promise((resolve) => {
      setTimeout(
        () => resolve(retry(fn, intervals, times + 1)),
        intervals[times]
      );
    });
  }
}

class Platform implements FuckSvga.Platform {
  private plugins: FuckSvga.PlatformPlugin<FuckSvga.PlatformProperties>[] = [
    pluginPath,
    pluginNow,
    pluginDecode,
    pluginFsm,
    pluginDownload,
    pluginRaf,
    pluginCanvas,
    pluginOfsCanvas,

    // 带依赖的插件，需要放在最后
    pluginImage,
  ];

  public global: FuckSvga.PlatformGlobal = {
    env: "unknown",
    br: null,
    dpr: 1,
    // isPerf: false,
    // sys: "UNKNOWN",
  };

  public noop = noop;

  public retry = retry;

  public now = noop as FuckSvga.Platform["now"];

  public path = {} as FuckSvga.Platform["path"];

  public local = {} as FuckSvga.Platform["local"];

  public remote = {} as FuckSvga.Platform["remote"];

  public decode = {} as FuckSvga.Platform["decode"];

  public image = {} as FuckSvga.Platform["image"];

  public rAF = noop as FuckSvga.Platform["rAF"];

  public getCanvas = noop as FuckSvga.Platform["getCanvas"];

  public getOfsCanvas = noop as FuckSvga.Platform["getOfsCanvas"];

  constructor() {
    this.global.env = this.autoEnv();
    this.init();
  }

  private init() {
    this.global.br = this.useBridge();
    this.global.dpr = this.usePixelRatio();
    this.usePlugins();
  }

  private autoEnv() {
    // FIXME：由于抖音场景支持wx对象，所以需要放在wx对象之前检查
    if (typeof window !== "undefined") {
      return "h5";
    }

    if (typeof tt !== "undefined") {
      return "tt";
    }

    if (typeof my !== "undefined") {
      return "alipay";
    }

    if (typeof wx !== "undefined") {
      return "weapp";
    }

    throw new Error("Unsupported app");
  }

  private useBridge() {
    switch (this.global.env) {
      case "h5":
        return globalThis;
      case "alipay":
        return my;
      case "tt":
        return tt;
      case "weapp":
        return wx;
      default:
    }

    return {};
  }

  private usePixelRatio() {
    const { env, br } = this.global;

    if (env === "h5") {
      return globalThis.devicePixelRatio;
    }

    if ("getWindowInfo" in br) {
      return (br as any).getWindowInfo().pixelRatio;
    }

    if ("getSystemInfoSync" in br) {
      return (br as WechatMiniprogram.Wx).getSystemInfoSync().pixelRatio;
    }

    return 1;
  }

  // private useSystem() {
  //   const { env, br } = this.global;

  //   if (env === "h5") {
  //     const UA = navigator.userAgent;

  //     if (/(Android)/i.test(UA)) {
  //       return "Android";
  //     }

  //     if (/(iPhone|iPad|iPod|iOS)/i.test(UA)) {
  //       return "iOS";
  //     }

  //     if (/(OpenHarmony|ArkWeb)/i.test(UA)) {
  //       return "OpenHarmony";
  //     }
  //   } else {
  //     if (env === "alipay") {
  //       return (br as any).getDeviceBaseInfo().platform as string;
  //     }

  //     if (env === "tt") {
  //       return (br as any).getDeviceInfoSync().platform as string;
  //     }

  //     if (env === "weapp") {
  //       return (br as any).getDeviceInfo().platform as string;
  //     }
  //   }

  //   return "UNKNOWN";
  // }

  private usePlugins() {
    this.plugins.forEach((plugin) => {
      const value = plugin.install.call(this);

      if (value !== undefined) {
        Reflect.set(this, plugin.name, value);
      }
    });
  }

  public switch(env: FuckSvga.SupportedPlatform) {
    this.global.env = env;
    this.init();
  }
}

export const platform = new Platform();
