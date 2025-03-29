import pluginPath from "./plugin-path";
import pluginDecode from "./plugin-decode";
import pluginDownload from "./plugin-download";
import pluginCanvas from "./plugin-canvas";
import pluginOfsCanvas from "./plugin-ofs-canvas";
import pluginImage from "./plugin-image";
import pluginRaf from "./plugin-raf";
import pluginFsm from "./plugin-fsm";

const useNow = () => {
  // performance可以提供更高精度的时间测量，且不受系统时间的调整（如更改系统时间或同步时间）的影响
  if (typeof performance !== "undefined") {
    return () => performance.now();
  }

  return () => Date.now();
};

export const noop: () => any = () => {};

class Platform implements IPlatform {
  private plugins: PlatformPlugin<PlatformProperties>[] = [
    pluginPath,
    pluginDecode,
    pluginFsm,
    pluginDownload,
    pluginRaf,
    pluginCanvas,
    pluginOfsCanvas,

    // 带依赖的插件，需要放在最后
    pluginImage
  ];

  public global: PlatformGlobal = {
    env: "unknown",
    br: null,
    fsm: null,
    dpr: 1,
    sys: "UNKNOWN",
  };

  public noop = noop;

  public now = useNow();

  public path = {} as IPlatform["path"];

  public local = {} as IPlatform["local"];

  public remote = {} as IPlatform["remote"];

  public decode = {} as IPlatform["decode"];

  public image = {} as IPlatform["image"];

  public rAF = noop as IPlatform["rAF"];

  public getCanvas = noop as IPlatform["getCanvas"];

  public getOfsCanvas = noop as IPlatform["getOfsCanvas"];

  constructor() {
    this.global.env = this.autoEnv();
    this.init();
  }

  private init() {
    this.global.br = this.useBridge();
    this.global.dpr = this.usePixelRatio();
    this.global.fsm = this.useFileSystemManager();
    this.global.sys = this.useSystem().toLocaleLowerCase();
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

  private useFileSystemManager() {
    const { br } = this.global;

    if ("getFileSystemManager" in br) {
      return (br as WechatMiniprogram.Wx).getFileSystemManager();
    }

    return null;
  }

  private useSystem() {
    const { env, br } = this.global;

    if (env === "h5") {
      const UA = navigator.userAgent;

      if (/(Android)/i.test(UA)) {
        return "Android";
      }

      if (/(iPhone|iPad|iPod|iOS)/i.test(UA)) {
        return "iOS";
      }

      if (/(OpenHarmony|ArkWeb)/i.test(UA)) {
        return "OpenHarmony";
      }
    } else {
      if (env === "alipay") {
        return (br as any).getDeviceBaseInfo().platform as string;
      }

      if (env === "tt") {
        return (br as any).getDeviceInfoSync().platform as string;
      }

      if (env === "weapp") {
        return (br as any).getDeviceInfo().platform as string;
      }
    }

    return "UNKNOWN";
  }

  private usePlugins() {
    this.plugins.forEach((plugin) => {
      const value = plugin.install.call(this);

      if (value !== undefined) {
        Reflect.set(this, plugin.name, value);
      }
    });
  }

  public switch(env: SupportedPlatform) {
    this.global.env = env;
    this.init();
  }
}

export const platform = new Platform();
